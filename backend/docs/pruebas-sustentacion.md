# Pruebas para la sustentación: autenticación y roles

## Prueba de integración de vehículos

La prueba `test/vehiculos.e2e-spec.ts` inicia la aplicación NestJS, firma un JWT
de administrador y usa una base MySQL exclusiva. Antes de ejecutarla, crea una
base vacía cuyo nombre termine en `_test`; la prueba activa TypeORM
`synchronize` solo para esa base, crea un cliente y un usuario temporales,
verifica `POST /vehiculos` y consulta directamente la FK `clienteId`. Al
finalizar elimina sus filas de vehículo, cliente y usuario.

Para compatibilidad con el paquete ESM `@nestjs/typeorm` del proyecto, la
configuración e2e lo sustituye por `test/mocks/nestjs-typeorm-e2e.ts`; ese
adaptador crea un `DataSource` y repositorios TypeORM reales, sin simular
consultas ni resultados de MySQL.

Desde `backend`, configura estas variables en la terminal, sin guardarlas en el
repositorio:

```powershell
$env:TEST_DB_HOST = "localhost"
$env:TEST_DB_PORT = "3306"
$env:TEST_DB_USERNAME = "<usuario MySQL de pruebas>"
$env:TEST_DB_PASSWORD = "<contraseña MySQL de pruebas>"
$env:TEST_DB_NAME = "night_owls_test"
npm run test:e2e:vehiculos
```

La prueba rechaza bases cuyo nombre no termine en `_test`. El resto de pruebas
e2e se ejecuta con `npm run test:e2e`.

Si Jest no hereda las variables de la terminal, guárdalas localmente en
`backend/.env.test.local` con los mismos nombres y valores del ejemplo. Ese
archivo está excluido de Git; no lo compartas ni lo agregues al commit.

## Preparación

1. Inicia MySQL y confirma que la base configurada para el backend existe y
   tiene el esquema actualizado. Si `DB_SYNCHRONIZE` no está activado, aplica
   una sola vez la migración descrita en
   [roles-proteccion-rutas.md](./roles-proteccion-rutas.md).
2. En `backend/.env`, conserva la configuración de conexión local y configura
   `JWT_SECRET` con un valor aleatorio privado. No compartas el archivo, el
   secreto, las contraseñas ni capturas que los muestren. La aplicación no
   proporciona un secreto predeterminado.
3. Asegura que existan dos usuarios **activos**: uno con rol `administrador` y
   otro con rol `recepcionista`. Si falta el administrador, créalo desde
   `backend` con `npm run admin:create`. Para crear o activar la cuenta de
   recepcionista, usa el flujo administrativo existente; no hay registro
   público.
4. Inicia el backend desde `backend` con `npm run start:dev` y confirma que
   escucha en `http://localhost:3000`.

## Importación y variables de Postman

1. Importa
   [night-owls-seguridad.postman_collection.json](./night-owls-seguridad.postman_collection.json)
   en Postman.
2. En la colección, abre **Variables** y completa localmente `adminEmail`,
   `adminPassword`, `recepcionistaEmail` y `recepcionistaPassword` con los
   usuarios activos que preparaste. `baseUrl` ya vale
   `http://localhost:3000`; déjalo así para ejecutar el backend local.
3. No agregues autorización a nivel de colección ni sobrescribas la
   autenticación individual de los requests. La colección usa `noauth` para los
   logins y para las dos pruebas sin credenciales; las solicitudes protegidas
   aplican explícitamente sus propios tokens Bearer.
4. Ejecuta los seis requests en el orden numerado, o ejecuta la colección
   completa en Collection Runner manteniendo ese orden. Cada login guarda
   automáticamente `access_token` en la variable local correspondiente de la
   colección. Los scripts no imprimen tokens ni contraseñas.

## Resultados esperados

| Orden | Solicitud                                            | Resultado                          |
| ----- | ---------------------------------------------------- | ---------------------------------- |
| 1     | `POST /auth/login` con credenciales de administrador | `200`; guarda `adminToken`         |
| 2     | `POST /auth/login` con credenciales de recepcionista | `200`; guarda `recepcionistaToken` |
| 3     | `GET /usuarios` con `adminToken`                     | `200`                              |
| 4     | `GET /usuarios` sin encabezado `Authorization`       | `401`                              |
| 5     | `GET /usuarios` con token inválido                   | `401`                              |
| 6     | `GET /usuarios` con `recepcionistaToken`             | `403`                              |

El login es público, pero los recursos privados requieren autenticación JWT.
Una identidad válida sin el rol requerido obtiene `403`; no se ha añadido un
endpoint público de registro.

Los tokens vencen a los **15 minutos**. Si una petición protegida pasa de
`200`/`403` a `401`, vuelve a ejecutar los dos logins y después las pruebas de
recursos para capturar tokens nuevos.
