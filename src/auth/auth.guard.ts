import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private configService: ConfigService) { }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    if (request.oidc && request.oidc.isAuthenticated()) {
      return true;
    } else {
      response.redirect(`${this.configService.get('BACKEND_BASE_URL')}/login`)
      // response.redirect(`${this.configService.get('AUTH0_DOMAIN')}/authorize?response_type=token&client_id=${this.configService.get('AUTH0_CLIENT_ID')}&redirect_uri=http://localhost:4000/v1/auth-callback`);
      return false;
    }
  }
}
