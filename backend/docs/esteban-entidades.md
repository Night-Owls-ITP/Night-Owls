# Entidades de Esteban

Base URL local: `http://localhost:3000`. Los identificadores de ruta y de
relaciones son enteros positivos. Las respuestas de columnas `DECIMAL` se
representan como cadenas con dos decimales.

## Endpoints

| Recurso | Métodos |
| --- | --- |
| `/mecanicos` | `POST`, `GET`; `/mecanicos/:id`: `GET`, `PATCH`, `DELETE` |
| `/servicios` | `POST`, `GET`; `/servicios/:id`: `GET`, `PATCH`, `DELETE` |
| `/detalles-servicio` | `POST`, `GET`; `/detalles-servicio/:id`: `GET`, `PATCH`, `DELETE` |
| `/citas` | `POST`, `GET`; `/citas/:id`: `GET`, `PATCH`, `DELETE` |

Las órdenes existentes aceptan además `mecanicoId` opcional en `POST
/ordenes-trabajo` y `PATCH /ordenes-trabajo/:id`. En un PATCH, `null` quita la
asignación; para asignar o reemplazarla se envía un ID de mecánico activo.

## Ejemplos para Postman

### Mecánico

`POST /mecanicos`

```json
{
  "nombre": "Ana Pérez",
  "documento": "MEC-2026-01",
  "telefono": "5550101",
  "especialidad": "Motor"
}
```

`PATCH /mecanicos/1` para desactivar sin borrar su historial:

```json
{ "activo": false }
```

Si se elimina físicamente un mecánico, `ordenes_trabajo.mecanicoId` queda en
`NULL` por la clave foránea `ON DELETE SET NULL`; se recomienda desactivarlo.

### Servicio

`POST /servicios`

```json
{
  "nombre": "Cambio de aceite",
  "descripcion": "Aceite y filtro de motor",
  "precioBase": 35.5
}
```

`PATCH /servicios/1` acepta `{ "activo": false }` para conservar detalles
históricos. `DELETE /servicios/1` responde conflicto si ya aparece en un
detalle.

### Detalle de servicio

`POST /detalles-servicio`

```json
{
  "ordenTrabajoId": 7,
  "servicioId": 1,
  "cantidad": 2
}
```

Al omitir `precioUnitario`, se guarda el precio base vigente del servicio. La
respuesta incluye `precioUnitario` y `subtotal`; por ejemplo, con precio
`35.50` y cantidad `2`, subtotal `71.00`. El precio unitario guardado no cambia
al editar el catálogo.

Para cambiar el servicio de un detalle, `PATCH /detalles-servicio/:id` debe
incluir tanto `servicioId` como `precioUnitario`. Ese precio explícito confirma
el nuevo valor aplicado; no se sustituye silenciosamente por el precio base ni
se reescriben otros detalles.

```json
{
  "servicioId": 2,
  "precioUnitario": 42.75
}
```

### Cita

`POST /citas`

```json
{
  "vehiculoId": 3,
  "fechaHora": "2026-10-06T14:30:00.000Z",
  "motivo": "Diagnóstico de frenos",
  "estado": "pendiente"
}
```

`fechaHora` utiliza una fecha/hora ISO 8601 con zona (`Z` o desplazamiento,
por ejemplo `2026-10-06T08:30:00-06:00`). Una cita no crea una orden. Si se
envía `ordenTrabajoId`, la orden debe pertenecer al mismo vehículo y no puede
estar ya asociada a otra cita. En PATCH, `ordenTrabajoId: null` desvincula la
orden; cualquier cambio de vehículo vuelve a validar la coherencia.

Estados admitidos: `pendiente`, `confirmada`, `cancelada` y `atendida`.

## Relaciones e integridad

- Un mecánico tiene muchas órdenes; cada orden tiene cero o un mecánico. La
  relación vive en `OrdenTrabajo`, admite `NULL` y usa `ON DELETE SET NULL`.
- Un servicio aparece en muchos detalles. Los detalles impiden borrar el
  servicio, pero permiten desactivarlo.
- Cada detalle referencia una orden y un servicio mediante relaciones
  `ManyToOne`, guarda cantidad y precio unitario histórico `DECIMAL(10,2)`.
  El subtotal se calcula en el servidor usando centavos enteros.
- Cada cita requiere un vehículo. Puede tener una sola orden opcional y cada
  orden puede estar asociada, como máximo, a una cita. El vínculo se guarda en
  `citas`; borrar la orden deja `ordenTrabajoId` en `NULL`.
- No se modifica el significado de `OrdenTrabajo.costo` ni se implementa
  facturación.

## Esquema MySQL

Con `DB_SYNCHRONIZE=true`, TypeORM sincroniza el esquema al iniciar la
aplicación. No cambie esa opción para ejecutar contra producción. Si la
sincronización está desactivada, aplique una sola vez la migración aditiva
desde `backend` contra la base de desarrollo, que ya debe contener
`vehiculos` y `ordenes_trabajo`:

```powershell
$config = @{}
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)$') {
    $config[$matches[1].Trim()] = $matches[2].Trim()
  }
}
Get-Content -Raw .\migrations\20261005-esteban-entidades.sql |
  & mysql "--host=$($config['DB_HOST'])" "--port=$($config['DB_PORT'])" `
    "--user=$($config['DB_USERNAME'])" --password "--database=$($config['DB_NAME'])"
```

`mysql` solicitará la contraseña interactivamente. La migración está en
`migrations/20261005-esteban-entidades.sql`; no elimina ni recrea tablas y
agrega la columna nullable del mecánico a las órdenes existentes.

## Orden sugerido de pruebas en Postman

1. Crear mecánico y servicio; listar y consultar ambos.
2. Crear una orden de trabajo con `mecanicoId`; probar un ID inexistente y
   desactivar el mecánico para comprobar que no se pueda asignar.
3. Crear detalle omitiendo el precio; cambiar `precioBase` del servicio y
   consultar el detalle para confirmar que conserva su precio/subtotal.
4. Intentar cambiar el detalle a otro servicio sin precio (debe fallar); repetir
   con `precioUnitario` explícito.
5. Crear cita para un vehículo; probar una orden del mismo vehículo y una orden
   de otro vehículo tanto al crear como al actualizar la cita.
6. Probar la desactivación de mecánico/servicio y las eliminaciones bloqueadas
   o permitidas por las relaciones descritas.
