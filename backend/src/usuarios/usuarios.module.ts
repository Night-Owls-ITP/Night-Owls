import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mecanico } from '../mecanicos/mecanico.entity';
import { Usuario } from './usuario.entity';
import { UsuariosController } from './usuarios.controller';
import { UsuariosService } from './usuarios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, Mecanico])],
  controllers: [UsuariosController],
  providers: [UsuariosService],
})
export class UsuariosModule {}
