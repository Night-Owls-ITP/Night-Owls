import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientesModule } from './clientes/clientes.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';

@Module({
  imports: [ClientesModule, VehiculosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
