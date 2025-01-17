import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  UseGuards,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from 'src/guard/jwt-auth.guard';
import { CreateUserDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() data: CreateUserDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.register(data);

    this.setTokenCookies(response, tokens);
    return { message: 'Registration successful' };
  }

  @Post('login')
  async login(
    @Body() data: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const tokens = await this.authService.login(data);
    this.setTokenCookies(response, tokens);
    return { message: 'Login successful' };
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
    const refreshToken = request.cookies?.['refresh_token'];
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token');
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
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    response.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearTokenCookies(response: Response) {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
  }
}
