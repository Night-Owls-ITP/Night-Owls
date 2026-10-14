# Autenticación JWT

## Archivos

Se añadieron:

- `src/auth/auth.controller.ts`: endpoint público de inicio de sesión.
- `src/auth/dto/login.dto.ts`: validación de correo y contraseña.
- `src/auth/public.decorator.ts`: metadato de rutas públicas.
- `src/auth/jwt-auth.guard.ts`: autenticación global con bearer tokens.
- `src/auth/jwt.strategy.ts`: validación de firma, expiración, usuario activo y vínculo de mecánico.
- `.env.example`: plantilla sin credenciales reales.
- `docs/autenticacion-jwt.md`: esta guía.

Se modificaron `src/auth/auth.module.ts`, `src/auth/roles.guard.ts`,
`src/auth/roles-http.spec.ts`, `src/app.module.ts`, `package.json` y
`package-lock.json`. Se eliminó `src/auth/basic-auth.guard.ts`; Basic Auth ya no
está disponible en las rutas privadas. No se cambiaron entidades, tablas ni
permisos de controladores.

## Dependencias

- `@nestjs/jwt` integra la firma y verificación de JWT en NestJS.
- `@nestjs/passport` conecta Passport con guards y estrategias de NestJS.
- `passport` proporciona el mecanismo de estrategias de autenticación.
- `passport-jwt` extrae el bearer token y valida firma y expiración.
- `@types/passport` y `@types/passport-jwt` proporcionan tipos de desarrollo.

## Flujo

1. `POST /auth/login` valida el cuerpo y reutiliza `AuthenticationService` para
   comprobar credenciales, estado de la cuenta y vínculo activo de mecánico.
2. Si las credenciales son válidas, el servidor devuelve `access_token` y una
   propiedad `user` con la identidad segura. El JWT contiene únicamente el
   identificador en `sub`; no contiene correo, contraseña, hash ni rol.
3. `JwtAuthGuard` exige `Authorization: Bearer <token>` en todas las rutas,
   excepto las marcadas con `@Public()`. La estrategia valida firma y
   expiración y consulta el usuario actual en la base de datos.
4. La estrategia rechaza usuarios inactivos y mecánicos sin vínculo activo y
   genera `request.user` con el rol vigente.
5. `RolesGuard` aplica la política `@Roles` existente después de autenticar.
   El administrador conserva el acceso global y las rutas sin política siguen
   siendo denegadas para los demás roles.

La duración del token está configurada explícitamente en **15 minutos**.
`JWT_SECRET` es obligatorio: la aplicación falla al inicializar si está ausente
o vacío. No existe un secreto predeterminado en el código.

## Configuración local

Desde la carpeta `backend`, si todavía no existe `.env`, créalo a partir de la
plantilla:

```powershell
Copy-Item .env.example .env
```

Si ya tienes un `.env`, consérvalo y añade o actualiza solamente las variables
necesarias. Configura allí tus datos de MySQL local. Genera un secreto aleatorio
de 32 bytes y añádelo directamente al archivo sin mostrarlo en pantalla:

```powershell
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 32
$rng.GetBytes($bytes)
$secret = [Convert]::ToBase64String($bytes)
$rng.Dispose()
Add-Content .env "JWT_SECRET=$secret"
```

Si ya existe una línea `JWT_SECRET`, reemplaza su valor en vez de añadir una
segunda. `.env` está excluido por Git; no lo subas ni compartas. Después instala
las dependencias y arranca el backend:

```powershell
npm install
npm run start:dev
```

También puedes crear el administrador inicial conservando el script existente:

```powershell
npm run admin:create
```

## Probar con Postman

1. Envía un `POST` a `http://localhost:3000/auth/login`.
2. En **Body → raw → JSON**, usa las credenciales del administrador o de otro
   usuario activo:

   ```json
   {
     "email": "admin@example.com",
     "password": "tu_contraseña"
   }
   ```

3. Copia `access_token` de la respuesta.
4. Para un endpoint privado, abre **Authorization → Bearer Token** y pega el
   token. Postman añadirá `Authorization: Bearer <token>` automáticamente.

## Respuestas comunes

- **200 OK**: login correcto; devuelve `access_token` y `user`, sin secretos.
- **401 Unauthorized**: credenciales incorrectas, token ausente, inválido o
  expirado, usuario desactivado o mecánico sin vínculo activo.
- **403 Forbidden**: token válido, pero el rol actual no permite acceder a la
  ruta.
