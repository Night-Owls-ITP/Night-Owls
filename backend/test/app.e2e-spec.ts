import { randomUUID } from 'node:crypto';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

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

describe('AppController authentication (e2e)', () => {
  let app: INestApplication<App> | undefined;
  let previousEnvironment: Map<string, string | undefined>;

  beforeEach(async () => {
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
  });

  it('/ (GET) requires authentication before invoking the controller', () => {
    if (!app) {
      throw new Error('The e2e application did not initialize');
    }

    return request(app.getHttpServer()).get('/').expect(401);
  });

  afterEach(async () => {
    try {
      await app?.close();
    } finally {
      app = undefined;
      for (const [name, value] of previousEnvironment) {
        if (value === undefined) {
          delete process.env[name];
        } else {
          process.env[name] = value;
        }
      }
    }
  });
});
