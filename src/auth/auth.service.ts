import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthEntity } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string): Promise<AuthEntity> {
    const user = await this.prisma.user.findUnique({ where: { email: email } });

    if (!user) {
      throw new HttpException(
        'Invalid e-mail and/or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    if (!passwordIsCorrect) {
      throw new HttpException(
        'Invalid e-mail and/or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      accessToken: this.jwtService.sign({ userId: user.id }),
    };
  }
}
