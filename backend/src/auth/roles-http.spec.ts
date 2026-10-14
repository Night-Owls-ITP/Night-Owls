import {
  Controller,
  Get,
  INestApplication,
  UnauthorizedException,
  ValidationPipe,
} from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ComprasController } from '../compras/compras.controller';
import { ComprasService } from '../compras/compras.service';
import { OrdenesTrabajoController } from '../ordenes-trabajo/ordenes-trabajo.controller';
import { OrdenesTrabajoService } from '../ordenes-trabajo/ordenes-trabajo.service';
import { PagosController } from '../pagos/pagos.controller';
import { PagosService } from '../pagos/pagos.service';
import { Usuario } from '../usuarios/usuario.entity';
import { UsuariosController } from '../usuarios/usuarios.controller';
import { UsuariosService } from '../usuarios/usuarios.service';
import { UserRole } from '../usuarios/user-role.enum';
import { AuthController } from './auth.controller';
import { AuthenticatedUser } from './authenticated-user';
import { AuthenticationService } from './authentication.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtStrategy } from './jwt.strategy';
import { RolesGuard } from './roles.guard';

const TEST_SECRET = 'local-test-secret-that-is-not-used-outside-this-suite';

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

jest.mock('@nestjs/config', () => ({
  ConfigService: class ConfigService {},
}));

describe('Global JWT and roles guards (HTTP)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  const identities: Record<string, AuthenticatedUser> = {
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
  const users = new Map<number, Usuario>();
  const orderService = {
    obtenerTodas: jest.fn((user: AuthenticatedUser) => [user]),
    obtenerPorId: jest.fn(),
  };

  beforeAll(async () => {
    for (const identity of Object.values(identities)) {
      users.set(identity.id, {
        ...identity,
        activo: true,
        mecanico:
          identity.rol === UserRole.MECANICO
            ? ({ id: 8, activo: true } as Usuario['mecanico'])
            : null,
      } as Usuario);
    }

    const usuarioRepository = {
      findOne: jest.fn(
        async ({ where }: { where: { id: number } }) =>
          users.get(where.id) ?? null,
      ),
    };

    const moduleRef = await Test.createTestingModule({
      imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.register({
          secret: TEST_SECRET,
          signOptions: { expiresIn: '15m' },
        }),
      ],
      controllers: [
        AuthController,
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
              const identity = Object.values(identities).find(
                (user) => user.email === email.trim().toLowerCase(),
              );
              if (!identity || password !== 'local-test-password') {
                throw new UnauthorizedException('Credenciales inválidas');
              }
              return identity;
            }),
          },
        },
        {
          provide: 'UsuarioRepository',
          useValue: usuarioRepository,
        },
        { provide: ConfigService, useValue: { get: () => TEST_SECRET } },
        { provide: UsuariosService, useValue: { obtenerTodos: () => [] } },
        {
          provide: ComprasService,
          useValue: { obtenerTodos: () => [] },
        },
        { provide: PagosService, useValue: { obtenerTodos: () => [] } },
        { provide: OrdenesTrabajoService, useValue: orderService },
        JwtStrategy,
        { provide: APP_GUARD, useClass: JwtAuthGuard },
        { provide: APP_GUARD, useClass: RolesGuard },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
    jwtService = app.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  async function login(email = identities.admin.email): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'local-test-password' })
      .expect(200);
    return response.body.access_token as string;
  }

  it('permits public login without a token and returns a safe identity and JWT', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: identities.admin.email,
        password: 'local-test-password',
      })
      .expect(200);

    expect(response.body.user).toEqual(identities.admin);
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user).not.toHaveProperty('passwordHash');
    expect(jwtService.verify(response.body.access_token)).toEqual(
      expect.objectContaining({
        sub: identities.admin.id,
        exp: expect.any(Number),
      }),
    );
  });

  it('rejects invalid login credentials with 401', async () => {
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: identities.admin.email, password: 'wrong-password' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: identities.admin.email, password: 'short' })
      .expect(401);
  });

  it('rejects protected routes when the bearer token is missing', async () => {
    await request(app.getHttpServer()).get('/usuarios').expect(401);
    await request(app.getHttpServer()).get('/compras').expect(401);
  });

  it('allows an administrator with a valid token and rejects malformed tokens', async () => {
    const token = await login();

    await request(app.getHttpServer())
      .get('/usuarios')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    await request(app.getHttpServer())
      .get('/usuarios')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);
  });

  it('rejects expired tokens', async () => {
    const expiredToken = await jwtService.signAsync(
      { sub: identities.admin.id },
      { expiresIn: '-1s' },
    );

    await request(app.getHttpServer())
      .get('/usuarios')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
  });

  it('returns 403 when a valid user has the wrong role', async () => {
    const token = await login(identities.receptionist.email);

    await request(app.getHttpServer())
      .get('/compras')
      .set('Authorization', `Bearer ${token}`)
      .expect(403);
  });

  it('uses the current database role rather than a role embedded in the token', async () => {
    const user = users.get(identities.receptionist.id)!;
    const token = await login(identities.receptionist.email);
    user.rol = UserRole.INVENTARISTA;

    try {
      await request(app.getHttpServer())
        .get('/compras')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
    } finally {
      user.rol = UserRole.RECEPCIONISTA;
    }
  });

  it('rejects a previously issued token after the user is deactivated', async () => {
    const token = await login();
    const user = users.get(identities.admin.id)!;
    user.activo = false;

    try {
      await request(app.getHttpServer())
        .get('/usuarios')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    } finally {
      user.activo = true;
    }
  });

  it('rejects mechanics whose linked mechanic record is no longer active', async () => {
    const token = await login(identities.mechanic.email);
    const mechanicUser = users.get(identities.mechanic.id)!;
    mechanicUser.mecanico!.activo = false;

    try {
      await request(app.getHttpServer())
        .get('/ordenes-trabajo')
        .set('Authorization', `Bearer ${token}`)
        .expect(401);
    } finally {
      mechanicUser.mecanico!.activo = true;
    }
  });

  it('denies non-admins when a route has no explicit role policy', async () => {
    const receptionistToken = await login(identities.receptionist.email);
    const adminToken = await login();

    await request(app.getHttpServer())
      .get('/unclassified')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .get('/unclassified')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);
  });

  it('preserves existing role policies and passes only the authenticated principal', async () => {
    const inventoryToken = await login(identities.inventory.email);
    const cashierToken = await login(identities.cashier.email);
    const receptionistToken = await login(identities.receptionist.email);

    await request(app.getHttpServer())
      .get('/compras')
      .set('Authorization', `Bearer ${inventoryToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get('/pagos')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .expect(403);
    await request(app.getHttpServer())
      .get('/pagos')
      .set('Authorization', `Bearer ${cashierToken}`)
      .expect(200);
    await request(app.getHttpServer())
      .get('/ordenes-trabajo?mecanicoId=999')
      .set('Authorization', `Bearer ${receptionistToken}`)
      .expect(200)
      .expect((response) => {
        expect(response.body).toEqual([identities.receptionist]);
        expect(response.body[0]).not.toHaveProperty('passwordHash');
      });
    expect(orderService.obtenerTodas).toHaveBeenCalledWith(
      identities.receptionist,
    );
  });
});
