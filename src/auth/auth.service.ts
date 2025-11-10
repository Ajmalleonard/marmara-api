import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { CreateUserDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-auth.dto';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendResetSuccessEmail,
} from '@/emails/emails';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const verificationToken = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    const user = await this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,

        verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await sendVerificationEmail(createUserDto.email, verificationToken);

    return this.generateTokens(user);
  }

  async login(loginDto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: loginDto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Update last login
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
      select: {
        id: true,
        email: true,
        name: true,
        isAdmin: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        // Include related data needed by the frontend
        wishlists: true,
        bookings: {
          include: {
            package: true,
          },
        },
        // If you later add reviews or other relations, include them here as well
      },
    });
    console.log(updatedUser);

    const tokens = this.generateTokens(user);

    const Data = {
      user: updatedUser,
      tokes: tokens,
    };

    return Data;
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
  }

  async getUsers() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        lastLogin: true,
        isVerified: true,
        isAdmin: true,
        resetPasswordToken: true,
        resetPasswordExpiresAt: true,
        verificationToken: true,
        verificationTokenExpiresAt: true,
        bookings: true,
        wishlists: true,
        wishlistIds: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteUser(userId: string) {
    try {
      await this.prisma.booking.deleteMany({
        where: { userId: userId },
      });

      // Delete all reservations for this user
      await this.prisma.reservation.deleteMany({
        where: { userId: userId },
      });

      const deletedUser = await this.prisma.user.delete({
        where: {
          id: userId,
        },
      });

      return { message: 'User deleted successfully' };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  async verifyEmail(token: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    await sendWelcomeEmail(user.email, user.name);

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null,
      },
    });
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const resetToken = uuidv4();
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });

    await sendPasswordResetEmail(email, resetURL);
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      },
    });

    await sendResetSuccessEmail(user.email);
  }

  private generateTokens(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '1h' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  // Microservice specific methods for gRPC compatibility

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      const { sub: userId } = payload;
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          isAdmin: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      return { user, payload };
    } catch (error: any) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async checkUserRole(userId: string, roles: string[]): Promise<boolean> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return false;
      }

      // Check if user is admin (assuming isAdmin field represents admin role)
      if (roles.includes('admin') && user.isAdmin) {
        return true;
      }

      // Check for customer role (default for non-admin users)
      if (roles.includes('customer') && !user.isAdmin) {
        return true;
      }

      return false;
    } catch (error: any) {
      return false;
    }
  }

  async checkResourceOwnership(
    userId: string,
    resourceId: string,
    resourceType: string,
  ): Promise<boolean> {
    try {
      // Check if the user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        return false;
      }

      // Admin always has access
      if (user.isAdmin) {
        return true;
      }

      // Check ownership based on resource type
      switch (resourceType) {
        case 'booking':
          const booking = await this.prisma.booking.findFirst({
            where: {
              id: resourceId,
              userId: userId,
            },
          });
          return !!booking;

        case 'reservation':
          const reservation = await this.prisma.reservation.findFirst({
            where: {
              id: resourceId,
              userId: userId,
            },
          });
          return !!reservation;

        case 'wishlist':
          // Check if user has the package in their wishlist
          const userWithWishlist = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: { wishlists: true },
          });
          return (
            userWithWishlist?.wishlists.some((pkg) => pkg.id === resourceId) ||
            false
          );

        default:
          return false;
      }
    } catch (error: any) {
      return false;
    }
  }
}
