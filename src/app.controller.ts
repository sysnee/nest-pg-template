import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/auth.guard';
import { Request } from 'express';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}

  @Get()
  @UseGuards(AuthGuard)
  async getHello(
    @Req() req: Request
  ) {
    return this.appService.getHello()
  }
}
