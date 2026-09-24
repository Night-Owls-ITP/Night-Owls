CREATE DATABASE IF NOT EXISTS night_owls_taller
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE night_owls_taller;

CREATE TABLE IF NOT EXISTS clientes (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(100) NOT NULL,
  documento VARCHAR(50) NOT NULL,
  telefono VARCHAR(50) NOT NULL,
  email VARCHAR(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_clientes_documento (documento),
  UNIQUE KEY uq_clientes_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vehiculos (
  id INT NOT NULL AUTO_INCREMENT,
  placa VARCHAR(10) NOT NULL,
  marca VARCHAR(50) NOT NULL,
  modelo VARCHAR(50) NOT NULL,
  anio INT NOT NULL,
  color VARCHAR(30) NOT NULL,
  clienteId INT NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_vehiculos_placa (placa),
  KEY idx_vehiculos_clienteId (clienteId),
  CONSTRAINT fk_vehiculos_cliente
    FOREIGN KEY (clienteId) REFERENCES clientes (id)
    ON DELETE CASCADE
    ON UPDATE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ordenes_trabajo (
  id INT NOT NULL AUTO_INCREMENT,
  vehiculoId INT NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  estado VARCHAR(30) NOT NULL,
  costo INT NOT NULL,
  fecha DATE NOT NULL,
  PRIMARY KEY (id),
  KEY idx_ordenes_trabajo_vehiculoId (vehiculoId),
  CONSTRAINT fk_ordenes_trabajo_vehiculo
    FOREIGN KEY (vehiculoId) REFERENCES vehiculos (id)
    ON DELETE CASCADE
    ON UPDATE RESTRICT
) ENGINE=InnoDB;
