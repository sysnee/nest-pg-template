import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './resources/users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';

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
    HttpModule,
    JwtModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
