import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwksClient } from 'jwks-rsa';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const client = new JwksClient({
      jwksUri: `${this.configService.get('AUTH0_DOMAIN')}/.well-known/jwks.json`,
    });
    
    function getKey(header, callback) {
      client.getSigningKey(header.kid, (err, key) => {
        console.log('getting key')
        if (err) {
          console.log('caiu no erro?')
          callback(err, null);
        } else {
          const signingKey = key.getPublicKey();
          console.log('signingKey', signingKey)
          callback(null, signingKey);
        }
      });
    }

    const validateAccessToken = (token) => {
      return new Promise((resolve, reject) => {
        jwt.verify(
          token,
          getKey,
          {
            algorithms: ["RS256"],
          },
          (err, decoded) => {
            if (err) {
              console.log(err)
              reject(false);
            } else {
              resolve(decoded);
            }
          }
        );
      });
    };

    const token = request.headers['authorization'].split(' ')[1].trim()

    const result = await validateAccessToken(token)

    return !!result;
  }
}
