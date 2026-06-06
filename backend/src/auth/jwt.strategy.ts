import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'zalo_smart_jwt_secret_token_123',
    });
  }

  async validate(payload: any) {
    if (!payload) {
      throw new UnauthorizedException('الرمز غير صالح أو منتهي الصلاحية');
    }
    return { id: payload.sub, email: payload.email, role: payload.role, name: payload.name };
  }
}
