import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';

import { CreateUserDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';
import { Auth } from '@/decorators/Auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() data: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    console.log('register');
    const tokens = await this.authService.register(data);

    this.setTokenCookies(response, tokens);
    return { message: 'Registration successful' };
  }

  @Get()
  @Auth()
  async getUsers() {
    const users = await this.authService.getUsers();
    return {
      message: 'success',
      users,
    };
  }

  @Post('login')
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const Data = await this.authService.login(data);

    // Set cookies with appropriate options
    response.cookie('access_token', Data.tokes.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'lax',

      maxAge: 60 * 60 * 1000, // 60min
    });

    response.cookie('refresh_token', Data.tokes.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'Login successful',
      user: Data.user,
    };
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) response: Response) {
    this.clearTokenCookies(response);
    return { message: 'Logout successful' };
  }

  @Get('verify/:token')
  async verifyEmail(@Param('token') token: string) {
    await this.authService.verifyEmail(token);
    return { message: 'Email verified successfully' };
  }

  @Post('password-reset-request')
  async requestPasswordReset(@Body() body: { email: string }) {
    await this.authService.requestPasswordReset(body.email);
    return { message: 'Password reset email sent' };
  }

  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body() body: { newpassword: string },
  ) {
    await this.authService.resetPassword(token, body.newpassword);
    return { message: 'Password reset successful' };
  }

  @Post('refresh')
  async refresh(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken =
      request.cookies?.refresh_token ||
      request.headers?.cookie
        ?.split(';')
        .find((c) => c.trim().startsWith('refresh_token='))
        ?.split('=')[1];

    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token found');
    }

    const tokens = await this.authService.refreshToken(refreshToken);
    this.setTokenCookies(response, tokens);
    return { message: 'Token refreshed' };
  }
  private setTokenCookies(
    response: Response,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    response.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 60 minutes
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearTokenCookies(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
  }
}
