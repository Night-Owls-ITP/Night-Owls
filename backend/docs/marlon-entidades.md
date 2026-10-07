# Entidades de Marlon

Base URL local: `http://localhost:3000`. Las columnas `DECIMAL(10,2)` se responden como cadenas con dos decimales y los identificadores de rutas son enteros positivos.

## Entidades y relaciones

### DetalleRepuesto (`detalles_repuesto`)
- Relación `ManyToOne` obligatoria con `OrdenTrabajo` y `Repuesto`.
- Guarda `cantidad` positiva y `precioUnitario` histórico.
- El subtotal se calcula en servidor con centavos enteros.
- El stock del repuesto baja al crear el detalle y vuelve al eliminarlo; si cambia la cantidad o el repuesto, se ajusta solo la diferencia.
- No se permite crear, mover o borrar un detalle cuando la orden ya está facturada.

### Factura (`facturas`)
- Relación `OneToOne` con `OrdenTrabajo` y restricción única por orden.
- `numero` es único y `total` lo calcula el servidor sumando `DetallesServicio` y `DetallesRepuesto`.
- `OrdenTrabajo.costo` no se suma y se conserva como dato histórico de la orden.
- La factura no permite modificar `ordenTrabajoId` ni `total` luego de emitirse.

### Pago (`pagos`)
- Relación `ManyToOne` con `Factura`.
- `valor` debe ser positivo; el servidor calcula total pagado y saldo pendiente.
- No se permite abonar más del saldo pendiente de la factura.
- Las actualizaciones se validan excluyendo el valor anterior del mismo pago.

### Usuario (`usuarios`)
- `password` entra por DTO y solo se almacena `passwordHash` con `bcryptjs`.
- `email` se normaliza a minúsculas y se valida duplicado.
- `rol` solo admite `administrador`, `recepcionista` y `mecanico`.
- El CRUD usa desactivación, no JWT ni autenticación global.

## Endpoints

- `/detalles-repuesto` — `POST`, `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- `/facturas` — `POST`, `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- `/pagos` — `POST`, `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id`
- `/usuarios` — `POST`, `GET`, `GET /:id`, `PATCH /:id`, `DELETE /:id`

## Ejemplos Postman

### Crear usuario
```json
{
  "nombre": "Ana García",
  "email": "ana@example.com",
  "password": "secreto123",
  "rol": "recepcionista"
}
```

### Crear detalle de repuesto
```json
{
  "ordenTrabajoId": 7,
  "repuestoId": 2,
  "cantidad": 3,
  "precioUnitario": 15.5
}
```

### Crear factura
```json
{
  "numero": "FAC-2026-0001",
  "ordenTrabajoId": 7,
  "fecha": "2026-10-06"
}
```

### Crear pago
```json
{
  "facturaId": 1,
  "valor": 80,
  "fecha": "2026-10-06",
  "metodo": "tarjeta",
  "referencia": "TX-001"
}
```

## Orden sugerido de pruebas

1. Crear usuario, repuesto y orden de trabajo.
2. Crear detalle de repuesto con stock suficiente.
3. Repetir el consumo con stock insuficiente para comprobar `400`.
4. Crear factura y confirmar que el total proviene de detalles, no de `ordenes_trabajo.costo`.
5. Intentar crear una segunda factura para la misma orden para comprobar `409`.
6. Crear pago con valor inferior al saldo; probar un pago superior para comprobar `400`.
7. Actualizar y eliminar pagos; verificar actualización de saldo y rechazo de cambios de factura.
8. Desactivar usuario y validar que no se expone `passwordHash` en respuestas.

## Esquema MySQL

La aplicación conserva `autoLoadEntities: true` y `DB_SYNCHRONIZE` bajo `DB_SYNCHRONIZE=true`. Si la sincronización está desactivada, aplique esta migración aditiva desde `backend` contra la base local:

```powershell
$config = @{}
Get-Content .env | ForEach-Object {
  if ($_ -match '^\s*([^#=]+)\s*=\s*(.*)$') {
    $config[$matches[1].Trim()] = $matches[2].Trim()
  }
}
Get-Content -Raw .\migrations\20261007-marlon-entidades.sql |
  & mysql "--host=$($config['DB_HOST'])" "--port=$($config['DB_PORT'])" `
    "--user=$($config['DB_USERNAME'])" --password "--database=$($config['DB_NAME'])"
```

La migración únicamente crea las cuatro tablas nuevas sin tocar los módulos de Esteban ni Luis.
