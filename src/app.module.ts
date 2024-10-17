import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './resources/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import * as express from 'express';
import { auth } from 'express-openid-connect';
import * as session from 'express-session';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isSQLite = configService.get<string>('DB_TYPE') === 'sqlite';
        return {
          type: isSQLite ? 'sqlite' : 'postgres',
          host: isSQLite ? undefined : configService.get<string>('DB_HOST'),
          port: isSQLite ? undefined : configService.get<number>('DB_PORT'),
          username: isSQLite ? undefined : configService.get<string>('DB_USERNAME'),
          password: isSQLite ? undefined : configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          entities: [join(__dirname, '**/*.entity{.ts,.js}')],
          synchronize: true,
        };
      },
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule implements NestModule {
  constructor(private configService: ConfigService) {}
  configure(consumer: MiddlewareConsumer) {
    const app = express();

    app.use(
      session({
        secret: this.configService.get<string>('SESSION_SECRET'),
        resave: false,
        saveUninitialized: false,
        cookie: {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
        },
      }),
    )

    app.use(
      auth({
        issuerBaseURL: this.configService.get<string>('AUTH0_DOMAIN'),
        baseURL: this.configService.get<string>('BACKEND_BASE_URL'),
        clientID: this.configService.get<string>('AUTH0_CLIENT_ID'),
        secret: this.configService.get<string>('AUTH0_CLIENT_SECRET'),
        authRequired: false,
        idpLogout: true,
      }),
    );

    consumer.apply(app).forRoutes('*');
  }
}