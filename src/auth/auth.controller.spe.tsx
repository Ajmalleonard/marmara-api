// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
// import { Request, Response } from 'express';

// describe('AuthController', () => {
//   let controller: AuthController;
//   let authService: AuthService;

//   const mockAuthService = {
//     register: jest.fn(),
//     login: jest.fn(),
//     verifyEmail: jest.fn(),
//     refreshToken: jest.fn(),
//     requestPasswordReset: jest.fn(),
//     resetPassword: jest.fn(),
//   };

//   const mockResponse = {
//     cookie: jest.fn().mockReturnThis(),
//     json: jest.fn().mockReturnThis(),
//   } as unknown as Response;

//   const mockRequest = {
//     cookies: {
//       refresh_token: 'old-refresh-token',
//     },
//   } as unknown as Request;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [AuthController],
//       providers: [
//         {
//           provide: AuthService,
//           useValue: mockAuthService,
//         },
//       ],
//     }).compile();

//     controller = module.get<AuthController>(AuthController);
//     authService = module.get<AuthService>(AuthService);
//   });

//   it('should be defined', () => {
//     expect(controller).toBeDefined();
//   });

//   describe('register', () => {
//     const registerDto = {
//       email: 'test@example.com',
//       password: 'password123',
//       name: 'Test User',
//     };

//     it('should register a new user and set cookies', async () => {
//       const authResult = {
//         accessToken: 'mock-access-token',
//         refreshToken: 'mock-refresh-token',
//       };

//       mockAuthService.register.mockResolvedValue(authResult);

//       await controller.register(registerDto, mockResponse);

//       expect(authService.register).toHaveBeenCalledWith(registerDto);
//       expect(mockResponse.cookie).toHaveBeenCalledWith(
//         'access_token',
//         authResult.accessToken,
//         expect.any(Object),
//       );
//       expect(mockResponse.cookie).toHaveBeenCalledWith(
//         'refresh_token',
//         authResult.refreshToken,
//         expect.any(Object),
//       );
//     });
//   });

//   describe('login', () => {
//     const loginDto = {
//       email: 'test@example.com',
//       password: 'password123',
//     };

//     it('should login user and set cookies', async () => {
//       const authResult = {
//         accessToken: 'mock-access-token',
//         refreshToken: 'mock-refresh-token',
//       };

//       mockAuthService.login.mockResolvedValue(authResult);

//       await controller.login(loginDto, mockResponse);

//       expect(authService.login).toHaveBeenCalledWith(loginDto);
//       expect(mockResponse.cookie).toHaveBeenCalledWith(
//         'access_token',
//         authResult.accessToken,
//         expect.any(Object),
//       );
//       expect(mockResponse.cookie).toHaveBeenCalledWith(
//         'refresh_token',
//         authResult.refreshToken,
//         expect.any(Object),
//       );
//     });
//   });

//   describe('verifyEmail', () => {
//     it('should verify email with token', async () => {
//       const token = 'verification-token';
//       const verificationResult = { isVerified: true };

//       mockAuthService.verifyEmail.mockResolvedValue(verificationResult);

//       const result = await controller.verifyEmail(token);

//       expect(authService.verifyEmail).toHaveBeenCalledWith(token);
//       expect(result).toEqual(verificationResult);
//     });
//   });

//   describe('refresh', () => {
//     it('should refresh tokens and set new cookies', async () => {
//       const newTokens = {
//         accessToken: 'new-access-token',
//         refreshToken: 'new-refresh-token',
//       };

//       mockAuthService.refreshToken.mockResolvedValue(newTokens);

//       await controller.refresh(mockRequest as Request, mockResponse);

//       expect(authService.refreshToken).toHaveBeenCalledWith(
//         'old-refresh-token',
//       );
//       expect(mockResponse.cookie).toHaveBeenCalledWith(
//         'access_token',
//         newTokens.accessToken,
//         expect.any(Object),
//       );
//       expect(mockResponse.cookie).toHaveBeenCalledWith(
//         'refresh_token',
//         newTokens.refreshToken,
//         expect.any(Object),
//       );
//     });
//   });

//   describe('requestPasswordReset', () => {
//     it('should request password reset', async () => {
//       const email = 'test@example.com';

//       await controller.requestPasswordReset({ email });

//       expect(authService.requestPasswordReset).toHaveBeenCalledWith(email);
//     });
//   });

//   describe('resetPassword', () => {
//     it('should reset password', async () => {
//       const token = 'reset-token';
//       const resetPasswordBody = {
//         newpassword: 'newPassword123',
//       };

//       await controller.resetPassword(token, resetPasswordBody);

//       expect(authService.resetPassword).toHaveBeenCalledWith(
//         token,
//         resetPasswordBody.newpassword,
//       );
//     });
//   });
// });
