import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Mecanico } from './mecanico.entity';
import { MecanicosController } from './mecanicos.controller';
import { MecanicosService } from './mecanicos.service';

@Module({
  imports: [TypeOrmModule.forFeature([Mecanico])],
  controllers: [MecanicosController],
  providers: [MecanicosService],
})
export class MecanicosModule {}
