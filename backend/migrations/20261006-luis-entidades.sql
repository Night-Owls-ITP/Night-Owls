CREATE TABLE IF NOT EXISTS `repuestos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(500) NOT NULL,
  `stock` int NOT NULL DEFAULT 0,
  `precioVenta` decimal(10,2) NOT NULL,
  `activo` tinyint NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_repuestos_codigo` (`codigo`),
  CONSTRAINT `CHK_repuestos_stock_no_negativo` CHECK (`stock` >= 0),
  CONSTRAINT `CHK_repuestos_precio_no_negativo` CHECK (`precioVenta` >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `nit` varchar(30) NOT NULL,
  `telefono` varchar(30) NOT NULL,
  `email` varchar(254) NOT NULL,
  `direccion` varchar(255) NOT NULL,
  `activo` tinyint NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_proveedores_nit` (`nit`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `proveedorId` int NOT NULL,
  `fecha` date NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  KEY `IDX_compras_proveedorId` (`proveedorId`),
  CONSTRAINT `CHK_compras_total_no_negativo` CHECK (`total` >= 0),
  CONSTRAINT `FK_compras_proveedor`
    FOREIGN KEY (`proveedorId`) REFERENCES `proveedores` (`id`)
    ON DELETE RESTRICT ON UPDATE NO ACTION
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `detalles_compra` (
  `id` int NOT NULL AUTO_INCREMENT,
  `compraId` int NOT NULL,
  `repuestoId` int NOT NULL,
  `cantidad` int NOT NULL,
  `costoUnitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_detalles_compra_compraId` (`compraId`),
  KEY `IDX_detalles_compra_repuestoId` (`repuestoId`),
  CONSTRAINT `CHK_detalles_compra_cantidad_positiva` CHECK (`cantidad` > 0),
  CONSTRAINT `CHK_detalles_compra_costo_no_negativo` CHECK (`costoUnitario` >= 0),
  CONSTRAINT `FK_detalles_compra_compra`
    FOREIGN KEY (`compraId`) REFERENCES `compras` (`id`)
    ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT `FK_detalles_compra_repuesto`
    FOREIGN KEY (`repuestoId`) REFERENCES `repuestos` (`id`)
    ON DELETE RESTRICT ON UPDATE NO ACTION
) ENGINE=InnoDB;