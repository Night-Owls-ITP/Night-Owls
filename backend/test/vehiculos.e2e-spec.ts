import { randomUUID } from 'node:crypto';
import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { DataSource, Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { Cliente } from '../src/clientes/cliente.entity';
import { Usuario } from '../src/usuarios/usuario.entity';
import { UserRole } from '../src/usuarios/user-role.enum';
import { Vehiculo } from '../src/vehiculos/vehiculo.entity';

const databaseEnvironment = [
  'TEST_DB_HOST',
  'TEST_DB_PORT',
  'TEST_DB_USERNAME',
  'TEST_DB_PASSWORD',
  'TEST_DB_NAME',
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_SYNCHRONIZE',
  'JWT_SECRET',
] as const;

describe('VehiculosController (e2e)', () => {
  let app: INestApplication<App> | undefined;
  let clienteRepository: Repository<Cliente> | undefined;
  let usuarioRepository: Repository<Usuario> | undefined;
  let vehiculoRepository: Repository<Vehiculo> | undefined;
  let dataSource: DataSource | undefined;
  let clienteId: number | undefined;
  let usuarioId: number | undefined;
  let placa: string | undefined;
  let previousEnvironment: Map<string, string | undefined>;

  beforeAll(async () => {
    previousEnvironment = new Map(
      databaseEnvironment.map((name) => [name, process.env[name]]),
    );
    await ConfigModule.forRoot({ envFilePath: '.env.test.local' });

    const requiredSetting = (name: string): string => {
      const value = process.env[name];
      if (!value?.trim()) {
        throw new Error(`Configure ${name} before running this MySQL test`);
      }
      return value;
    };
    const testDatabase = {
      host: requiredSetting('TEST_DB_HOST'),
      port: requiredSetting('TEST_DB_PORT'),
      username: requiredSetting('TEST_DB_USERNAME'),
      password: requiredSetting('TEST_DB_PASSWORD'),
      name: requiredSetting('TEST_DB_NAME'),
    };
    if (!/_test$/i.test(testDatabase.name)) {
      throw new Error('TEST_DB_NAME must end with "_test"');
    }
    const port = Number(testDatabase.port);
    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error('TEST_DB_PORT must be a valid TCP port');
    }

    process.env.DB_HOST = testDatabase.host;
    process.env.DB_PORT = String(port);
    process.env.DB_USERNAME = testDatabase.username;
    process.env.DB_PASSWORD = testDatabase.password;
    process.env.DB_NAME = testDatabase.name;
    process.env.DB_SYNCHRONIZE = 'true';
    process.env.JWT_SECRET = randomUUID();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();

    clienteRepository = app.get<Repository<Cliente>>(
      getRepositoryToken(Cliente),
    );
    usuarioRepository = app.get<Repository<Usuario>>(
      getRepositoryToken(Usuario),
    );
    vehiculoRepository = app.get<Repository<Vehiculo>>(
      getRepositoryToken(Vehiculo),
    );
    dataSource = app.get(DataSource);
  });

  afterAll(async () => {
    try {
      if (placa && vehiculoRepository) {
        await vehiculoRepository.delete({ placa });
      }
      if (clienteId !== undefined && clienteRepository) {
        await clienteRepository.delete({ id: clienteId });
      }
      if (usuarioId !== undefined && usuarioRepository) {
        await usuarioRepository.delete({ id: usuarioId });
      }
    } finally {
      try {
        await app?.close();
      } finally {
        if (previousEnvironment) {
          for (const [name, value] of previousEnvironment) {
            if (value === undefined) {
              delete process.env[name];
            } else {
              process.env[name] = value;
            }
          }
        }
      }
    }
  });

  it('crea un vehículo autorizado y confirma en MySQL su asociación al cliente', async () => {
    if (!app || !clienteRepository || !usuarioRepository || !dataSource) {
      throw new Error('The MySQL test application did not initialize');
    }

    const uniqueId = randomUUID().replace(/-/g, '');
    placa = `T${uniqueId.slice(0, 8).toUpperCase()}`;
    const cliente = await clienteRepository.save(
      clienteRepository.create({
        nombre: 'Cliente e2e',
        documento: `TEST-${uniqueId}`,
        telefono: '3000000000',
        email: `cliente-${uniqueId}@example.test`,
      }),
    );
    clienteId = cliente.id;
    const usuario = await usuarioRepository.save(
      usuarioRepository.create({
        nombre: 'Usuario e2e',
        email: `admin-${uniqueId}@example.test`,
        passwordHash: 'unused-by-jwt-e2e-test',
        rol: UserRole.ADMINISTRADOR,
        activo: true,
      }),
    );
    usuarioId = usuario.id;
    const token = app.get(JwtService).sign({ sub: usuario.id });

    await request(app.getHttpServer())
      .post('/vehiculos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        clienteId: cliente.id,
        placa,
        marca: 'Toyota',
        modelo: 'Corolla',
        anio: 2022,
        color: 'Azul',
      })
      .expect(201);

    const rows: Array<{ cliente_id: number | string }> = await dataSource.query(
      'SELECT `clienteId` AS `cliente_id` FROM `vehiculos` WHERE `placa` = ?',
      [placa],
    );
    expect(rows).toHaveLength(1);
    expect(Number(rows[0].cliente_id)).toBe(cliente.id);
  });
});
