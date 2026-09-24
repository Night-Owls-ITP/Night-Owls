import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ClientesModule } from './clientes/clientes.module';
import { VehiculosModule } from './vehiculos/vehiculos.module';
import { OrdenesTrabajoModule } from './ordenes-trabajo/ordenes-trabajo.module';

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

        synchronize: false,
      }),
    }),

    ClientesModule,
    VehiculosModule,
    OrdenesTrabajoModule,
  ],

  controllers: [AppController],

  providers: [AppService],
})
export class AppModule {}