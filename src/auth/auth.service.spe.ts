// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from './auth.service';
// import { PrismaService } from '../prisma/prisma.service';
// import { JwtService } from '@nestjs/jwt';
// import { UnauthorizedException, BadRequestException } from '@nestjs/common';
// import * as bcrypt from 'bcrypt';

// jest.mock('../emails/emails', () => ({
//   sendVerificationEmail: jest.fn(),
//   sendWelcomeEmail: jest.fn(),
//   sendPasswordResetEmail: jest.fn(),
//   sendResetSuccessEmail: jest.fn(),
// }));

// describe('AuthService', () => {
//   let service: AuthService;
//   let prismaService: PrismaService;
//   let jwtService: JwtService;

//   const mockUser = {
//     id: '1',
//     email: 'test@example.com',
//     password: 'hashedPassword',
//     name: 'Test User',
//     isAdmin: false,
//     isVerified: false,
//     verificationToken: 'token123',
//     verificationTokenExpiresAt: new Date(),
//     resetPasswordToken: null,
//     resetPasswordExpiresAt: null,
//     lastLogin: null,
//     createdAt: new Date(),
//     updatedAt: new Date(),
//     wishlistIds: [],
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         {
//           provide: PrismaService,
//           useValue: {
//             user: {
//               findUnique: jest.fn(),
//               findFirst: jest.fn(),
//               create: jest.fn(),
//               update: jest.fn(),
//             },
//           },
//         },
//         {
//           provide: JwtService,
//           useValue: {
//             sign: jest.fn(() => 'signed-token'),
//             verify: jest.fn(),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//     prismaService = module.get<PrismaService>(PrismaService);
//     jwtService = module.get<JwtService>(JwtService);
//   });

//   describe('register', () => {
//     const registerDto = {
//       email: 'test@example.com',
//       password: 'password123',
//       name: 'Test User',
//     };

//     it('should register a new user successfully', async () => {
//       jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
//       jest.spyOn(prismaService.user, 'create').mockResolvedValue(mockUser);
//       jest
//         .spyOn(bcrypt, 'hash')
//         .mockImplementation(() => Promise.resolve('hashedPassword'));

//       const result = await service.register(registerDto);

//       expect(result).toHaveProperty('accessToken');
//       expect(result).toHaveProperty('refreshToken');
//     });

//     it('should throw BadRequestException if email already exists', async () => {
//       jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

//       await expect(service.register(registerDto)).rejects.toThrow(
//         BadRequestException,
//       );
//     });
//   });

//   describe('login', () => {
//     const loginDto = {
//       email: 'test@example.com',
//       password: 'password123',
//     };

//     it('should login successfully with valid credentials', async () => {
//       jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
//       jest
//         .spyOn(bcrypt, 'compare')
//         .mockImplementation(() => Promise.resolve(true));

//       const result = await service.login(loginDto);

//       expect(result).toHaveProperty('accessToken');
//       expect(result).toHaveProperty('refreshToken');
//     });

//     it('should throw UnauthorizedException with invalid credentials', async () => {
//       jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
//       jest
//         .spyOn(bcrypt, 'compare')
//         .mockImplementation(() => Promise.resolve(false));

//       await expect(service.login(loginDto)).rejects.toThrow(
//         UnauthorizedException,
//       );
//     });
//   });

//   describe('verifyEmail', () => {
//     it('should verify email successfully with valid token', async () => {
//       jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);
//       jest.spyOn(prismaService.user, 'update').mockResolvedValue({
//         ...mockUser,
//         isVerified: true,
//         verificationToken: null,
//       });

//       const result = await service.verifyEmail('valid-token');

//       expect(result.isVerified).toBe(true);
//       expect(result.verificationToken).toBeNull();
//     });

//     it('should throw BadRequestException with invalid token', async () => {
//       jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

//       await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
//         BadRequestException,
//       );
//     });
//   });

//   describe('refreshToken', () => {
//     it('should refresh token successfully with valid token', async () => {
//       jest
//         .spyOn(jwtService, 'verify')
//         .mockReturnValue({ sub: '1', email: 'test@example.com' });
//       jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);

//       const result = await service.refreshToken('valid-token');

//       expect(result).toHaveProperty('accessToken');
//       expect(result).toHaveProperty('refreshToken');
//     });

//     it('should throw UnauthorizedException with invalid token', async () => {
//       jest.spyOn(jwtService, 'verify').mockImplementation(() => {
//         throw new Error();
//       });

//       await expect(service.refreshToken('invalid-token')).rejects.toThrow(
//         UnauthorizedException,
//       );
//     });
//   });

//   describe('requestPasswordReset', () => {
//     it('should generate reset token successfully', async () => {
//       jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(mockUser);
//       jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);

//       await expect(
//         service.requestPasswordReset('test@example.com'),
//       ).resolves.not.toThrow();
//     });

//     it('should throw BadRequestException for non-existent user', async () => {
//       jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

//       await expect(
//         service.requestPasswordReset('nonexistent@example.com'),
//       ).rejects.toThrow(BadRequestException);
//     });
//   });

//   describe('resetPassword', () => {
//     it('should reset password successfully with valid token', async () => {
//       jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(mockUser);
//       jest.spyOn(prismaService.user, 'update').mockResolvedValue(mockUser);
//       jest
//         .spyOn(bcrypt, 'hash')
//         .mockImplementation(() => Promise.resolve('newHashedPassword'));

//       await expect(
//         service.resetPassword('valid-token', 'newPassword123'),
//       ).resolves.not.toThrow();
//     });

//     it('should throw BadRequestException with invalid token', async () => {
//       jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

//       await expect(
//         service.resetPassword('invalid-token', 'newPassword123'),
//       ).rejects.toThrow(BadRequestException);
//     });
//   });
// });
