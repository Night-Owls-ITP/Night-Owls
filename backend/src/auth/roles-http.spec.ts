import {
  Controller,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ComprasController } from '../compras/compras.controller';
import { ComprasService } from '../compras/compras.service';
import { OrdenesTrabajoController } from '../ordenes-trabajo/ordenes-trabajo.controller';
import { OrdenesTrabajoService } from '../ordenes-trabajo/ordenes-trabajo.service';
import { PagosController } from '../pagos/pagos.controller';
import { PagosService } from '../pagos/pagos.service';
import { UsuariosController } from '../usuarios/usuarios.controller';
import { UsuariosService } from '../usuarios/usuarios.service';
import { UserRole } from '../usuarios/user-role.enum';
import { AuthenticationService } from './authentication.service';
import { BasicAuthGuard } from './basic-auth.guard';
import { RolesGuard } from './roles.guard';

@Controller('unclassified')
class UnclassifiedController {
  @Get()
  get() {
    return 'admin-only by default';
  }
}

jest.mock('@nestjs/typeorm', () => ({
  ...jest.requireActual('@nestjs/typeorm'),
  InjectDataSource: () => () => undefined,
}));

describe('Global Basic and roles guards (HTTP)', () => {
  let app: INestApplication;
  const identities = {
    admin: {
      id: 1,
      nombre: 'Admin',
      email: 'admin@example.test',
      rol: UserRole.ADMINISTRADOR,
    },
    receptionist: {
      id: 2,
      nombre: 'Recepción',
      email: 'receptionist@example.test',
      rol: UserRole.RECEPCIONISTA,
    },
    inventory: {
      id: 3,
      nombre: 'Inventario',
      email: 'inventory@example.test',
      rol: UserRole.INVENTARISTA,
    },
    mechanic: {
      id: 5,
      nombre: 'Mecánico',
      email: 'mechanic@example.test',
      rol: UserRole.MECANICO,
    },
    cashier: {
      id: 4,
      nombre: 'Caja',
      email: 'cashier@example.test',
      rol: UserRole.CAJERO,
    },
  };

  const orderService = {
    obtenerTodas: jest.fn((user) => [user]),
    obtenerPorId: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [
        UnclassifiedController,
        UsuariosController,
        ComprasController,
        PagosController,
        OrdenesTrabajoController,
      ],
      providers: [
        {
          provide: AuthenticationService,
          useValue: {
            authenticate: jest.fn(async (email: string, password: string) => {
              const identity =
                identities[email.split('@')[0] as keyof typeof identities];
              if (!identity || password !== 'local-test-password') {
                throw new UnauthorizedException('Credenciales inválidas');
              }
              return identity;
            }),
          },
        },
        { provide: UsuariosService, useValue: { obtenerTodos: () => [] } },
        {
          provide: ComprasService,
          useValue: { obtenerTodos: () => [] },
        },
        { provide: PagosService, useValue: { obtenerTodos: () => [] } },
        { provide: OrdenesTrabajoService, useValue: orderService },
        { provide: APP_GUARD, useClass: BasicAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 401 before role evaluation when Basic credentials are absent or invalid', async () => {
    await request(app.getHttpServer()).get('/usuarios').expect(401);
    await request(app.getHttpServer()).post('/usuarios').expect(401);
    await request(app.getHttpServer())
      .get('/usuarios')
      .auth('unknown@example.test', 'bad', { type: 'basic' })
      .expect(401);
  });

  it('allows administrator user management and blocks other roles', async () => {
    await request(app.getHttpServer())
      .get('/usuarios')
      .auth('admin@example.test', 'local-test-password', { type: 'basic' })
      .expect(200);
    await request(app.getHttpServer())
      .get('/usuarios')
      .auth('inventory@example.test', 'local-test-password', {
        type: 'basic',
      })
      .expect(403);
  });

  it('denies a non-admin when a new route has no explicit role policy', async () => {
    await request(app.getHttpServer())
      .get('/unclassified')
      .auth('receptionist@example.test', 'local-test-password', {
        type: 'basic',
      })
      .expect(403);
    await request(app.getHttpServer())
      .get('/unclassified')
      .auth('admin@example.test', 'local-test-password', { type: 'basic' })
      .expect(200);
  });

  it('allows inventory operations only for the inventory role and admin', async () => {
    await request(app.getHttpServer())
      .get('/compras')
      .auth('inventory@example.test', 'local-test-password', {
        type: 'basic',
      })
      .expect(200);
    await request(app.getHttpServer())
      .get('/compras')
      .auth('receptionist@example.test', 'local-test-password', {
        type: 'basic',
      })
      .send({ rol: 'administrador', mecanicoId: 999 })
      .expect(403);
  });

  it('blocks receptionist payments and permits cashier payments', async () => {
    await request(app.getHttpServer())
      .get('/pagos')
      .auth('receptionist@example.test', 'local-test-password', {
        type: 'basic',
      })
      .expect(403);
    await request(app.getHttpServer())
      .get('/pagos')
      .auth('cashier@example.test', 'local-test-password', { type: 'basic' })
      .expect(200);
  });

  it('passes only the authenticated principal to a permitted controller', async () => {
    await request(app.getHttpServer())
      .get('/ordenes-trabajo?mecanicoId=999')
      .auth('receptionist@example.test', 'local-test-password', {
        type: 'basic',
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual([identities.receptionist]);
        expect(response.body[0]).not.toHaveProperty('passwordHash');
      });
    expect(orderService.obtenerTodas).toHaveBeenCalledWith(
      identities.receptionist,
    );
  });

  it('does not use a client-supplied mechanic ID as the identity', async () => {
    await request(app.getHttpServer())
      .get('/ordenes-trabajo?mecanicoId=999')
      .auth('mechanic@example.test', 'local-test-password', {
        type: 'basic',
      })
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual([identities.mechanic]);
      });
    expect(orderService.obtenerTodas).toHaveBeenLastCalledWith(
      identities.mechanic,
    );
  });
});
