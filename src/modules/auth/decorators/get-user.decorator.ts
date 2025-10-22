import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../database/entities/user.entity';

/**
 * Custom decorator to extract the authenticated user from the request
 * @example
 * ```
 * @Get('profile')
 * getProfile(@GetUser() user: User) {
 *   return user;
 * }
 * ```
 */
export const GetUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | any => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
