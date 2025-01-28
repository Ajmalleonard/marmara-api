import { UseGuards, applyDecorators } from '@nestjs/common';
import { JwtAuthGuard } from '@/guard/jwt-auth.guard';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
export function Auth() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}

export const GetUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (data) {
      return request.user[data];
    }
    return request.user;
  },
);
