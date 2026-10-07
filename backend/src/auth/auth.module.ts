import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { AuthenticationService } from './authentication.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthModule {}
