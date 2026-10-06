import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ClientesModule } from './clientes/clientes.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { OrdenesTrabajoModule } from './ordenes-trabajo/ordenes-trabajo.module';
import { MecanicosModule } from './mecanicos/mecanicos.module';
import { ServiciosModule } from './servicios/servicios.module';
import { DetallesServicioModule } from './detalles-servicio/detalles-servicio.module';
import { CitasModule } from './citas/citas.module';
import { RepuestosModule } from './repuestos/repuestos.module';
import { ProveedoresModule } from './proveedores/proveedores.module';
import { ComprasModule } from './compras/compras.module';
import { DetallesCompraModule } from './detalles-compra/detalles-compra.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: 'mysql',

        host: configService.get<string>('DB_HOST'),

        port: Number(
          configService.get<string>('DB_PORT'),
        ),

        username:
          configService.get<string>('DB_USERNAME'),

        password:
          configService.get<string>('DB_PASSWORD'),

        database:
          configService.get<string>('DB_NAME'),

        autoLoadEntities: true,

        synchronize:
          configService.get<string>('DB_SYNCHRONIZE') === 'true',
      }),
    }),

    ClientesModule,
    VehiculosModule,
    OrdenesTrabajoModule,
    MecanicosModule,
    ServiciosModule,
    DetallesServicioModule,
    CitasModule,
    RepuestosModule,
    ProveedoresModule,
    ComprasModule,
    DetallesCompraModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}