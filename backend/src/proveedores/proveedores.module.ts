import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Compra } from '../compras/compra.entity';
import { Proveedor } from './proveedor.entity';
import { ProveedoresController } from './proveedores.controller';
import { ProveedoresService } from './proveedores.service';

@Module({
  imports: [TypeOrmModule.forFeature([Proveedor, Compra])],
  controllers: [ProveedoresController],
  providers: [ProveedoresService],
})
export class ProveedoresModule {}
