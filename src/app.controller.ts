import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(
    private configService: ConfigService,
    private readonly appService: AppService
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('login')
  login(@Res() res: Response) {
    res.redirect(`${this.configService.get('AUTH0_DOMAIN')}/authorize?response_type=token&client_id=${this.configService.get('AUTH0_CLIENT_ID')}&redirect_uri=${this.configService.get('BACKEND_BASE_URL')}/callback`);
  }

  @Get('auth-callback')
  async authCallback(@Req() req: Request, @Res() res: Response) {
    const { code } = req.query;

    // TODO: Exchange the authorization code for an access token and refresh token
    // const { access_token, refresh_token } = await this.authService.exchangeCode(code);
  }

  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    req['session']?.destroy((err) => {
      if (err) {
        console.error('Error destroying session:', err);
      }
    });

    res.clearCookie('access_token');

    const auth0Domain = this.configService.get<string>('AUTH0_DOMAIN')
    const clientId = this.configService.get<string>('AUTH0_CLIENT_ID')
    const returnTo = this.configService.get<string>('BASE_URL')

    const logoutUrl = `${auth0Domain}/v2/logout?client_id=${clientId}&returnTo=http://localhost:4000/v1/login`;

    // Redirect to Auth0 logout
    res.redirect(logoutUrl);
  }
}
