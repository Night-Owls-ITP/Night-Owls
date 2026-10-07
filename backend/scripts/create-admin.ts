import { NestFactory } from '@nestjs/core';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { AppModule } from '../src/app.module';
import { UsuariosService } from '../src/usuarios/usuarios.service';
import { UserRole } from '../src/usuarios/user-role.enum';

async function leerDato(
  prompt: string,
  environmentValue: string | undefined,
  input: ReturnType<typeof createInterface>,
): Promise<string> {
  if (environmentValue !== undefined) {
    return environmentValue;
  }
  return input.question(prompt);
}

async function crearAdministradorInicial(): Promise<void> {
  const input = createInterface({ input: stdin, output: stdout });
  let application: Awaited<
    ReturnType<typeof NestFactory.createApplicationContext>
  > | undefined;

  try {
    const nombre = await leerDato('Nombre del administrador: ', process.env.ADMIN_NAME, input);
    const email = await leerDato('Correo del administrador: ', process.env.ADMIN_EMAIL, input);
    const password = await leerDato(
      'Contraseña del administrador (mínimo 8 caracteres): ',
      process.env.ADMIN_PASSWORD,
      input,
    );

    application = await NestFactory.createApplicationContext(AppModule, {
      logger: false,
    });
    const usuariosService = application.get(UsuariosService);
    const administrador = await usuariosService.crear({
      nombre,
      email,
      password,
      rol: UserRole.ADMINISTRADOR,
      activo: true,
    });

    console.log(`Administrador inicial creado: ${administrador.email}`);
  } finally {
    input.close();
    if (application) {
      await application.close();
    }
  }
}

crearAdministradorInicial().catch((error: unknown) => {
  console.error(
    error instanceof Error ? error.message : 'No se pudo crear el administrador',
  );
  process.exitCode = 1;
});
