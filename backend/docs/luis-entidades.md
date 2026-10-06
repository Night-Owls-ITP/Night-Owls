# Entidades de Luis

Base URL local: `http://localhost:3000`. Los identificadores de rutas y
relaciones son enteros positivos. Las columnas `DECIMAL(10,2)` se devuelven
como cadenas con dos decimales; `subtotal` es un cálculo de respuesta y no una
columna editable.

## Entidades y relaciones

- `Proveedor` (`proveedores`) puede tener muchas compras. Su NIT es único; las
  compras impiden borrarlo y puede desactivarse con `PATCH`.
- `Repuesto` (`repuestos`) tiene código único, stock inicial cero, precio de
  venta y estado activo. El CRUD no acepta stock: las entradas se registran
  mediante detalles de compra. Los detalles impiden borrar el repuesto.
- `Compra` (`compras`) requiere un proveedor activo al crearla o reasignarla.
  Su total siempre lo calcula el servidor y es cero si no contiene detalles.
- `DetalleCompra` (`detalles_compra`) requiere compra, repuesto activo al
  registrar, cantidad positiva y costo unitario histórico. Su subtotal es
  `cantidad × costoUnitario`.
- Crear, actualizar o eliminar un detalle mueve stock y recalcula los totales
  implicados dentro de una transacción. Un cambio de costo no mueve inventario;
  mover el detalle a otra compra conserva exactamente el movimiento de stock.
  Las operaciones bloquean las compras y repuestos por ID ascendente. Las
  relaciones usan `ON DELETE RESTRICT` para impedir borrados que eludan esos
  movimientos.

## Endpoints y Postman

Todos los recursos incluyen `GET` para listar, `GET /:id`, `PATCH /:id` y
`DELETE /:id`, además de los `POST` mostrados. Eliminar un repuesto con detalles,
un proveedor con compras o una compra con detalles responde `409`; desactive
repuestos y proveedores cuando deban conservar su historial.

### Orden sugerido

1. Crear proveedor.
2. Crear repuesto.
3. Crear compra.
4. Crear detalle de compra.

`POST /proveedores`:

```json
{
  "nombre": "Suministros del Norte",
  "nit": "0614-010190-101-2",
  "telefono": "5550101",
  "email": "ventas@example.com",
  "direccion": "Calle 10, San Salvador"
}
```

`POST /repuestos` (stock siempre inicia en cero; enviar `stock` responde `400`):

```json
{
  "codigo": "FILTRO-ACEITE-01",
  "nombre": "Filtro de aceite",
  "descripcion": "Filtro para motor 1.6",
  "precioVenta": 12.5
}
```

`POST /compras` (el cliente no puede enviar `total`):

```json
{
  "proveedorId": 1,
  "fecha": "2026-10-06"
}
```

`POST /detalles-compra`:

```json
{
  "compraId": 1,
  "repuestoId": 1,
  "cantidad": 4,
  "costoUnitario": 8.25
}
```

La respuesta del detalle incluye `subtotal: "33.00"`; el repuesto aumenta
cuatro unidades y la compra suma `"33.00"`. El costo queda congelado aunque
cambie después el precio de venta del catálogo.

### Actualizaciones y errores

- `PATCH /detalles-compra/1` con `{ "cantidad": 6 }` aplica únicamente dos
  unidades al stock y recalcula el total.
- `PATCH /detalles-compra/1` con `{ "repuestoId": 2 }` retira la cantidad
  completa del repuesto anterior y la ingresa al nuevo repuesto activo.
- `PATCH /detalles-compra/1` con `{ "costoUnitario": 9.15 }` actualiza subtotal
  y total, sin tocar stock.
- `PATCH /detalles-compra/1` con `{ "compraId": 2 }` recalcula las compras
  anterior y nueva, sin duplicar movimiento de inventario.
- `PATCH /repuestos/1` con `{ "activo": false }` y
  `PATCH /proveedores/1` con `{ "activo": false }` conservan referencias.
- IDs inexistentes responden `404`; validaciones de DTO y falta de stock,
  `400`; código/NIT duplicados y conflictos de integridad, `409`.
- Probar un PATCH con `null` en un campo obligatorio, crear compra para
  proveedor inexistente/inactivo, registrar detalle para repuesto inexistente/
  inactivo, e intentar borrar recursos con historial.
- La eliminación de un detalle descuenta la cantidad aportada y recalcula la
  compra. Si el stock ya no alcanza, la transacción completa se revierte.

## Pruebas automatizadas

Desde `backend`, ejecutar `npm test -- --runInBand`. Las pruebas del servicio de
detalles cubren relaciones, entradas, costo histórico, subtotal/totales, cambio
de cantidad/repuesto/compra, falta de stock y reversión ante exceso de total.
Los tests unitarios usan un manager simulado; no prueban bloqueos, rollback ni
concurrencia reales de MySQL.

## Creación del esquema MySQL

La aplicación conserva `autoLoadEntities: true` y solo activa `synchronize`
cuando `DB_SYNCHRONIZE=true`. No lo active en producción. Si está desactivado,
desde `backend` aplique una vez la migración aditiva al esquema de desarrollo
que ya contiene las tablas base y las tablas de Esteban:

```powershell
$config = @{}
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)$') {
    $config[$matches[1].Trim()] = $matches[2].Trim()
  }
}
Get-Content -Raw .\migrations\20261006-luis-entidades.sql |
  & mysql "--host=$($config['DB_HOST'])" "--port=$($config['DB_PORT'])" `
    "--user=$($config['DB_USERNAME'])" --password "--database=$($config['DB_NAME'])"
```

`mysql` solicita la contraseña de forma interactiva. La migración solo crea las
cuatro tablas nuevas con claves foráneas, índices únicos y restricciones; no
modifica ni vuelve a ejecutar la migración de Esteban. Confirme los nombres de
base/host desde su `.env` local sin compartirlo y verifique las tablas después
de aplicarla.
