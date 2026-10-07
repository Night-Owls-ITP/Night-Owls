# Primera entrega: usuarios y protección por roles

## Matriz de permisos

La matriz se define antes de aplicar metadatos `@Roles` a los controladores.
`Admin` representa `administrador`; `Recep`, `Mec`, `Inv` y `Caja`
representan `recepcionista`, `mecanico`, `inventarista` y `cajero`.
Los recursos no mencionados para un rol se deniegan. Todas las rutas requieren
HTTP Basic válido; el guard de roles deniega cualquier endpoint sin política
explícita a usuarios que no sean administradores.

| Recurso | GET | POST | PATCH | DELETE |
| --- | --- | --- | --- | --- |
| clientes | Admin, Recep, Caja | Admin, Recep | Admin, Recep | Admin |
| vehiculos | Admin, Recep, Caja | Admin, Recep | Admin, Recep | Admin |
| citas | Admin, Recep | Admin, Recep | Admin, Recep | Admin |
| ordenes-trabajo | Admin, Recep, Mec*, Caja | Admin, Recep | Admin | Admin |
| detalles-servicio | Admin, Mec*, Caja | Admin, Mec* | Admin, Mec* | Admin, Mec* |
| detalles-repuesto | Admin, Mec*, Caja | Admin, Mec* | Admin, Mec* | Admin, Mec* |
| servicios | Admin, Mec | Admin | Admin | Admin |
| repuestos | Admin, Mec, Inv | Admin, Inv | Admin, Inv | Admin, Inv |
| mecanicos | Admin | Admin | Admin | Admin |
| proveedores | Admin, Inv | Admin, Inv | Admin, Inv | Admin, Inv |
| compras | Admin, Inv | Admin, Inv | Admin, Inv | Admin, Inv |
| detalles-compra | Admin, Inv | Admin, Inv | Admin, Inv | Admin, Inv |
| facturas | Admin, Caja | Admin, Caja | Admin, Caja | Admin, Caja |
| pagos | Admin, Caja | Admin, Caja | Admin, Caja | Admin, Caja |
| usuarios y catálogo de roles | Admin | Admin | Admin | Admin |

`Mec*` solo puede consultar órdenes vinculadas al mecánico asociado a su cuenta
y gestionar detalles de servicio/repuesto cuya orden le pertenezca. Una
actualización de detalle debe respetar tanto la orden original como la nueva.

## Roles y permisos

- **administrador**: acceso completo y único rol que crea/actualiza/desactiva
  usuarios o cambia roles. Puede consultar el catálogo de roles.
- **recepcionista**: alta, consulta y actualización de clientes, vehículos y
  citas; alta y consulta de órdenes. No puede eliminar órdenes ni modificar
  inventario, facturas, pagos o usuarios.
- **mecanico**: consulta el catálogo de servicios y repuestos; consulta solo
  las órdenes que tiene asignadas y gestiona sus detalles de servicio/repuesto.
- **inventarista**: gestiona repuestos, proveedores, compras y detalles de
  compra. No administra usuarios ni pagos.
- **cajero**: consulta clientes, vehículos, órdenes y detalles; gestiona
  facturas y pagos. No modifica inventario ni usuarios.

El administrador siempre puede acceder a una ruta protegida. Una ruta sin
política explícita solo es accesible al administrador.

## Archivos creados y propósito

- `src/usuarios/user-role.enum.ts`: definición única de los cinco roles.
- `src/auth/authenticated-user.ts`: tipo seguro del usuario autenticado.
- `src/auth/roles.decorator.ts`: define las políticas `@Roles(...)`.
- `src/auth/basic-auth.guard.ts`: extrae y valida el encabezado Basic.
- `src/auth/authentication.service.ts`: busca el usuario, verifica bcrypt y
  construye una identidad sin secretos.
- `src/auth/roles.guard.ts`: aplica las políticas con `Reflector`.
- `src/auth/auth.module.ts`: registra autenticación y el repositorio requerido.
- `scripts/create-admin.ts`: crea de forma explícita el primer administrador.
- `migrations/20261008-roles-proteccion-rutas.sql`: amplía enum y añade el
  vínculo opcional y único con mecánico sin reemplazar tablas ni datos.
- `src/auth/authentication.service.spec.ts`: credenciales correctas,
  normalización, cuentas inactivas y vínculo mecánico inválido.
- `src/auth/roles-http.spec.ts`: pruebas HTTP de ambos guards, orden 401/403,
  rutas sin política, privilegios por rol y datos de identidad confiables.
- `src/ordenes-trabajo/ordenes-trabajo.service.spec.ts` y
  `src/detalles-servicio/detalles-servicio.service.spec.ts`: filtro de órdenes
  y validación de propiedad al gestionar detalles.
- `test/app.e2e-spec.ts`: actualiza la expectativa de `/` a `401` sin Basic,
  porque la ruta ya no es pública.

Los controladores existentes incorporan `@Roles` de acuerdo con la matriz.
Los servicios de órdenes y detalles aplican además la autorización por registro
para las cuentas de mecánico.

## @Roles, Reflector y guards

`@Roles(UserRole.RECEPCIONISTA, ...)` guarda metadatos en el método o en el
controlador. El `RolesGuard` usa `Reflector.getAllAndOverride` para que una
política del método pueda sustituir a la política general del controlador.
El administrador tiene acceso permitido en ambos casos. Si falta metadato,
otros roles reciben `403`; esto evita que una ruta nueva quede abierta por
omisión.

Los dos guards se registran globalmente en `AppModule`, en este orden:
`BasicAuthGuard` y luego `RolesGuard`. Así todos los endpoints existentes y
nuevos requieren identidad autenticada y después permiso por rol.

## Flujo de una petición y errores

1. El cliente envía `Authorization: Basic <base64(correo:contraseña)>`.
2. El guard valida el esquema y la codificación; no registra el encabezado.
3. El servicio normaliza el correo, consulta usuario activo y solicita
   explícitamente `passwordHash` para comparar con bcryptjs.
4. Si las credenciales son válidas, el guard fija `request.user` con solo
   `id`, `nombre`, `email` y `rol`.
5. `RolesGuard` lee la política del endpoint y autoriza o devuelve `403`.
6. Para mecánicos, el servicio verifica también que la orden esté asignada al
   mecánico vinculado a la cuenta.
7. Solo entonces se ejecuta el controlador.

`401 Unauthorized` significa que falta o no es válida la identificación.
`403 Forbidden` significa que la identidad es válida, pero no tiene el rol o
el acceso al registro solicitado.

HTTP Basic es provisional para esta entrega y debe usarse sobre HTTPS salvo en
pruebas locales. En la siguiente entrega podrá reemplazarse la identificación
por JWT; la autorización `@Roles` y `RolesGuard` seguirá leyendo el mismo
`request.user` y podrá mantenerse.

## Relación Usuario–Mecanico

`Usuario` es el lado propietario de la relación `OneToOne` y contiene un
`mecanicoId` nullable con clave foránea y restricción única. Un mecánico puede
estar vinculado a como máximo un usuario. Al crear o modificar un usuario, el
servicio valida el vínculo y, si el rol es `mecanico`, exige un mecánico
existente y activo. En cada consulta sensible, la identidad procede de Basic y
el ID del mecánico se recupera desde la base de datos; no se acepta un
`mecanicoId` enviado por el cliente para autorizar.

## Configuración de Postman

En cada request seleccione **Authorization → Basic Auth**, configure el correo
y contraseña del usuario y deje que Postman genere el encabezado. No envíe
credenciales ni el valor de `Authorization` en parámetros, cuerpos o logs.
Para desarrollo local, confirme antes que la URL sea la del backend local; en
entornos compartidos o públicos, use HTTPS.

## Casos de prueba manuales

- **administrador**: `GET /usuarios/roles`, alta/actualización/desactivación
  de usuarios y acceso a las operaciones de todos los recursos.
- **recepcionista**: puede `POST /clientes`, `PATCH /citas/:id` y
  `POST /ordenes-trabajo`; recibe `403` en `DELETE /ordenes-trabajo/:id`,
  `POST /compras` y `GET /pagos`.
- **mecanico**: puede consultar servicios/repuestos y sus órdenes/detalles;
  recibe `403` para una orden ajena, una orden suministrada como destino ajeno,
  `POST /compras` o `/usuarios`.
- **inventarista**: puede crear repuestos, proveedores, compras y detalles de
  compra; recibe `403` en `GET /usuarios` y `GET /pagos`.
- **cajero**: puede consultar clientes, vehículos, órdenes y detalles y crear
  facturas/abonos; recibe `403` al modificar repuestos o usuarios.
- Sin Basic Auth o con contraseña incorrecta: `401`, incluso antes de evaluar
  el rol. Un rol o `mecanicoId` añadido al JSON no cambia la identidad.

## Administrador inicial

Ejecute desde `backend`:

```powershell
npm run admin:create
```

El script acepta `ADMIN_NAME`, `ADMIN_EMAIL` y `ADMIN_PASSWORD` desde el
entorno; los datos que falten se solicitan interactivamente. También respeta
`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` y la configuración
TypeORM existente. El rol se fija en `administrador`; el script llama al flujo
normal de creación, que rechaza un correo existente en lugar de modificarlo.
No guarde credenciales en el repositorio ni comparta el `.env`.

## Esquema MySQL

La configuración TypeORM no cambia y `synchronize` permanece condicionado por
`DB_SYNCHRONIZE === 'true'`. Si la sincronización está desactivada, aplique una
sola vez la migración desde `backend` con la herramienta `mysql`, usando los
valores de conexión de su entorno:

```powershell
$config = @{}
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)$') {
    $config[$matches[1].Trim()] = $matches[2].Trim()
  }
}
Get-Content -Raw .\migrations\20261008-roles-proteccion-rutas.sql |
  & mysql "--host=$($config['DB_HOST'])" "--port=$($config['DB_PORT'])" `
    "--user=$($config['DB_USERNAME'])" --password "--database=$($config['DB_NAME'])"
```

La operación `ALTER TABLE` conserva las filas y amplía los valores permitidos.
No active `synchronize` de forma implícita ni aplique la migración dos veces.
