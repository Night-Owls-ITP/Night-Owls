# Protección de rutas por roles

## Autenticación y autorización

La aplicación usa JWT como mecanismo de **autenticación** y `@Roles(...)` como
mecanismo de **autorización**:

- `POST /auth/login` es la única ruta pública. Recibe correo y contraseña, y
  devuelve `access_token` y la identidad segura del usuario.
- Para las demás rutas, envía `Authorization: Bearer <access_token>`.
  `JwtAuthGuard` valida el token y carga la identidad y el rol actuales desde la
  base de datos.
- `RolesGuard` comprueba los roles autorizados para el método. El administrador
  conserva acceso completo; una ruta sin política explícita solo permite al
  administrador.
- `@Roles(...)` se aplica en **cada método HTTP**, no en la clase del
  controlador. Así cada endpoint declara por sí mismo su política efectiva.
- No se usa Basic Auth ni se habilitan otras rutas públicas.

`401 Unauthorized` significa que no se presentó una identidad válida: token
ausente, inválido, vencido o asociado a una cuenta inactiva. `403 Forbidden`
significa que el token es válido, pero el rol autenticado no tiene permiso para
esa operación.

## Matriz verificada en los controladores

`Admin`, `Recep`, `Mec`, `Inv` y `Caja` significan `administrador`,
`recepcionista`, `mecanico`, `inventarista` y `cajero`. Las operaciones no
listadas para un rol se deniegan. La matriz refleja los `@Roles` actuales de
cada método, no metadatos heredados de la clase.

| Recurso | GET (colección/detalle) | POST | PATCH | DELETE |
| --- | --- | --- | --- | --- |
| `/` (`AppController`) | Admin | — | — | — |
| `/usuarios` y `/usuarios/roles` | Admin | Admin | Admin | Admin |
| `/clientes` | Admin, Recep, Caja | Admin, Recep | Admin, Recep | Admin |
| `/vehiculos` | Admin, Recep, Caja | Admin, Recep | Admin, Recep | Admin |
| `/citas` | Admin, Recep | Admin, Recep | Admin, Recep | Admin |
| `/ordenes-trabajo` | Admin, Recep, Mec*, Caja | Admin, Recep | Admin | Admin |
| `/detalles-servicio` | Admin, Mec*, Caja | Admin, Mec* | Admin, Mec* | Admin, Mec* |
| `/detalles-repuesto` | Admin, Mec*, Caja | Admin, Mec* | Admin, Mec* | Admin, Mec* |
| `/servicios` | Admin, Mec | Admin | Admin | Admin |
| `/repuestos` | Admin, Mec, Inv | Admin, Inv | Admin, Inv | Admin |
| `/mecanicos` | Admin | Admin | Admin | Admin |
| `/proveedores` | Admin, Inv | Admin, Inv | Admin, Inv | Admin, Inv |
| `/compras` | Admin, Inv | Admin, Inv | Admin, Inv | Admin, Inv |
| `/detalles-compra` | Admin, Inv | Admin, Inv | Admin, Inv | Admin, Inv |
| `/facturas` | Admin, Caja | Admin, Caja | Admin, Caja | Admin, Caja |
| `/pagos` | Admin, Caja | Admin, Caja | Admin, Caja | Admin, Caja |

`Mec*`: el mecánico solo puede consultar las órdenes vinculadas a su cuenta y
gestionar detalles de servicio o repuesto de sus órdenes. Las restricciones de
propiedad se validan en los servicios, además de la política de roles. Al
actualizar un detalle, se verifica la orden original y la nueva.

El `DELETE /repuestos/:id` es exclusivo de administrador, igual que antes de
trasladar las políticas a los métodos. Los roles de método se conservaron sin
ampliar ni reducir el acceso efectivo previo.

## Guards y flujo JWT

`JwtAuthGuard` y `RolesGuard` están registrados globalmente en `AppModule`, en
ese orden:

1. El cliente envía el token Bearer, excepto en `POST /auth/login`.
2. `JwtAuthGuard` valida firma y vencimiento. La estrategia comprueba la cuenta
   actual y fija `request.user` con identidad segura y rol vigente.
3. `RolesGuard` permite al administrador o coteja el rol actual con el
   `@Roles(...)` explícito del método. Un rol añadido a los datos enviados por
   el cliente no altera la identidad.
4. Los servicios de órdenes y detalles de servicio/repuesto aplican también
   las restricciones por propiedad para mecánicos.
5. Solo después se ejecuta el método del controlador.

El JWT vence a los **15 minutos**. No se registra ni se debe compartir el token,
la contraseña ni el contenido del archivo `.env`.

## Relación Usuario–Mecánico

`Usuario` es el lado propietario de la relación `OneToOne` y contiene un
`mecanicoId` nullable, con clave foránea y restricción única. Un mecánico puede
estar vinculado a como máximo un usuario. Al crear o modificar un usuario, el
servicio valida el vínculo y, si el rol es `mecanico`, exige un mecánico
existente y activo. Para autorizar operaciones sensibles, el mecánico vinculado
se obtiene desde la base de datos; no se acepta un `mecanicoId` del cliente.

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
