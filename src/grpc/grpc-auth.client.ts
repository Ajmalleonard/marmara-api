import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc } from '@nestjs/microservices';
import { grpcClientOptions } from './grpc-client.options';


interface AuthService {
  validateToken(data: { token: string }): Promise<any>;
  checkRole(data: { user_id: string; roles: string[] }): Promise<any>;
  checkOwnership(data: { user_id: string; resource_id: string; resource_type: string }): Promise<any>;
  login(data: { email: string; password: string }): Promise<any>;
  register(data: { email: string; password: string; name: string }): Promise<any>;
  forgotPassword(data: { email: string }): Promise<any>;
  resetPassword(data: { token: string; password: string }): Promise<any>;
  verifyEmail(data: { code: string }): Promise<any>;
}

@Injectable()
export class GrpcAuthClient implements OnModuleInit {
  @Client(grpcClientOptions)
  private client: ClientGrpc;

  private authService: AuthService;

  onModuleInit() {
    this.authService = this.client.getService<AuthService>('AuthService');
  }

  async validateToken(token: string) {
    try {
      return await this.authService.validateToken({ token });
    } catch (error) {
      throw new Error(`gRPC call failed: ${error.message}`);
    }
  }

  async checkRole(userId: string, roles: string[]) {
    try {
      return await this.authService.checkRole({ user_id: userId, roles });
    } catch (error) {
      throw new Error(`gRPC call failed: ${error.message}`);
    }
  }

  async checkOwnership(userId: string, resourceId: string, resourceType: string) {
    try {
      return await this.authService.checkOwnership({ 
        user_id: userId, 
        resource_id: resourceId, 
        resource_type: resourceType 
      });
    } catch (error) {
      throw new Error(`gRPC call failed: ${error.message}`);
    }
  }

  async login(email: string, password: string) {
    try {
      return await this.authService.login({ email, password });
    } catch (error) {
      throw new Error(`gRPC call failed: ${error.message}`);
    }
  }

  async register(email: string, password: string, name: string) {
    try {
      return await this.authService.register({ email, password, name });
    } catch (error) {
      throw new Error(`gRPC call failed: ${error.message}`);
    }
  }

  async forgotPassword(email: string) {
    try {
      return await this.authService.forgotPassword({ email });
    } catch (error) {
      throw new Error(`gRPC call failed: ${error.message}`);
    }
  }

  async resetPassword(token: string, password: string) {
    try {
      return await this.authService.resetPassword({ token, password });
    } catch (error) {
      throw new Error(`gRPC call failed: ${error.message}`);
    }
  }

  async verifyEmail(code: string) {
    try {
      return await this.authService.verifyEmail({ code });
    } catch (error) {
      throw new Error(`gRPC call failed: ${error.message}`);
    }
  }
}