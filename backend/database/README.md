# Esquema de base de datos

## Requisitos

- MySQL 8.x o compatible.
- Credenciales con permisos para crear la base y las tablas.
- La aplicacion debe usar el mismo valor de `DB_NAME` que el script: `night_owls_taller`.

## Crear el esquema

Desde la carpeta `backend`:

```bash
mysql -h 127.0.0.1 -P 3306 -u root -p < database/schema.sql
```

El comando solicita la contrasena de MySQL. El script crea `night_owls_taller`, selecciona esa base y crea `clientes`, `vehiculos` y `ordenes_trabajo` en el orden correcto. Es no destructivo: no elimina tablas ni datos existentes. `IF NOT EXISTS` evita recrear tablas ya presentes, pero no corrige automaticamente una tabla existente con una estructura diferente.

La aplicacion tiene `synchronize: false` en TypeORM. Esto evita que NestJS altere una base existente al iniciar. El esquema debe aplicarse y revisarse de forma controlada antes de levantar la aplicacion.

## Respaldo antes de aplicar cambios

Si la base local ya contiene datos, respalde primero la base completa:

```bash
mysqldump -h 127.0.0.1 -P 3306 -u root -p --single-transaction --routines --triggers night_owls_taller > night_owls_taller_backup.sql
```

Revise especialmente duplicados en `clientes.documento`, `clientes.email` y `vehiculos.placa`, ademas de filas existentes sin un cliente o vehiculo valido. Para una base antigua sin estas columnas o claves foraneas, prepare una migracion no destructiva separada: agregue las columnas como anulables, complete sus valores mediante una correspondencia validada, compruebe que no queden nulos ni huerfanos, y despues convierta las columnas a `NOT NULL` y agregue las claves foraneas. No ejecute `DROP DATABASE`, `DROP TABLE` ni `TRUNCATE` como parte de este proceso.

## Prueba reproducible de cascadas

Con la API levantada y apuntando a la base creada (`npm run start:dev` desde `backend`), ejecute:

```bash
$base = 'http://localhost:3000'

$cliente = Invoke-RestMethod -Method Post -Uri "$base/clientes" -ContentType 'application/json' -Body (@{
  nombre = 'Cliente Cascada Uno'
  documento = 'CAS-001'
  telefono = '3000000001'
  email = 'cascada-uno@example.com'
} | ConvertTo-Json)

$vehiculo = Invoke-RestMethod -Method Post -Uri "$base/vehiculos" -ContentType 'application/json' -Body (@{
  clienteId = $cliente.id
  placa = 'CAS001'
  marca = 'Toyota'
  modelo = 'Yaris'
  anio = 2022
  color = 'Rojo'
} | ConvertTo-Json)

$orden = Invoke-RestMethod -Method Post -Uri "$base/ordenes-trabajo" -ContentType 'application/json' -Body (@{
  vehiculoId = $vehiculo.id
  descripcion = 'Revision de frenos'
  estado = 'ABIERTA'
  costo = 150000
  fecha = '2026-09-23'
} | ConvertTo-Json)

Invoke-RestMethod -Method Delete -Uri "$base/vehiculos/$($vehiculo.id)"
Invoke-RestMethod -Method Get -Uri "$base/ordenes-trabajo/$($orden.id)"
# Debe responder HTTP 404.

$clienteDos = Invoke-RestMethod -Method Post -Uri "$base/clientes" -ContentType 'application/json' -Body (@{
  nombre = 'Cliente Cascada Dos'
  documento = 'CAS-002'
  telefono = '3000000002'
  email = 'cascada-dos@example.com'
} | ConvertTo-Json)

$vehiculoDos = Invoke-RestMethod -Method Post -Uri "$base/vehiculos" -ContentType 'application/json' -Body (@{
  clienteId = $clienteDos.id
  placa = 'CAS002'
  marca = 'Kia'
  modelo = 'Rio'
  anio = 2023
  color = 'Azul'
} | ConvertTo-Json)

$ordenDos = Invoke-RestMethod -Method Post -Uri "$base/ordenes-trabajo" -ContentType 'application/json' -Body (@{
  vehiculoId = $vehiculoDos.id
  descripcion = 'Cambio de aceite'
  estado = 'ABIERTA'
  costo = 90000
  fecha = '2026-09-23'
} | ConvertTo-Json)

Invoke-RestMethod -Method Delete -Uri "$base/clientes/$($clienteDos.id)"
Invoke-RestMethod -Method Get -Uri "$base/vehiculos/$($vehiculoDos.id)"
# Debe responder HTTP 404.
Invoke-RestMethod -Method Get -Uri "$base/ordenes-trabajo/$($ordenDos.id)"
# Debe responder HTTP 404.
```

Para comprobarlo directamente en MySQL, use los identificadores devueltos por la API:

```sql
USE night_owls_taller;
SELECT * FROM ordenes_trabajo WHERE id = <orden_id_despues_de_borrar_vehiculo>;
SELECT * FROM vehiculos WHERE id = <vehiculo_id_despues_de_borrar_cliente>;
SELECT * FROM ordenes_trabajo WHERE id = <orden_id_despues_de_borrar_cliente>;
```

Las tres consultas deben devolver cero filas. La primera FK borra las ordenes al borrar un vehiculo; la segunda borra los vehiculos al borrar un cliente y la primera propaga la eliminacion a sus ordenes.

Tambien se puede probar la validacion de referencias inexistentes: `POST /vehiculos` con un `clienteId` que no existe y `POST /ordenes-trabajo` con un `vehiculoId` que no existe deben responder HTTP 404.
