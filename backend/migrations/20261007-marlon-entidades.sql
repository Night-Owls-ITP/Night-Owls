CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `passwordHash` varchar(255) NOT NULL,
  `rol` varchar(30) NOT NULL,
  `activo` tinyint NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_usuarios_email` (`email`),
  CONSTRAINT `CHK_usuarios_rol` CHECK (`rol` IN ('administrador', 'recepcionista', 'mecanico'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `facturas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `ordenTrabajoId` int NOT NULL,
  `fecha` date NOT NULL,
  `total` decimal(10,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_facturas_numero` (`numero`),
  UNIQUE KEY `UQ_facturas_ordenTrabajoId` (`ordenTrabajoId`),
  KEY `IDX_facturas_ordenTrabajoId` (`ordenTrabajoId`),
  CONSTRAINT `CHK_facturas_total_no_negativo` CHECK (`total` >= 0),
  CONSTRAINT `FK_facturas_orden_trabajo`
    FOREIGN KEY (`ordenTrabajoId`) REFERENCES `ordenes_trabajo` (`id`)
    ON DELETE RESTRICT ON UPDATE NO ACTION
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `pagos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `facturaId` int NOT NULL,
  `valor` decimal(10,2) NOT NULL,
  `fecha` date NOT NULL,
  `metodo` varchar(30) NOT NULL,
  `referencia` varchar(150) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_pagos_facturaId` (`facturaId`),
  CONSTRAINT `CHK_pagos_valor_positivo` CHECK (`valor` > 0),
  CONSTRAINT `FK_pagos_factura`
    FOREIGN KEY (`facturaId`) REFERENCES `facturas` (`id`)
    ON DELETE RESTRICT ON UPDATE NO ACTION
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `detalles_repuesto` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ordenTrabajoId` int NOT NULL,
  `repuestoId` int NOT NULL,
  `cantidad` int NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_detalles_repuesto_ordenTrabajoId` (`ordenTrabajoId`),
  KEY `IDX_detalles_repuesto_repuestoId` (`repuestoId`),
  CONSTRAINT `CHK_detalles_repuesto_cantidad_positiva` CHECK (`cantidad` > 0),
  CONSTRAINT `CHK_detalles_repuesto_precio_no_negativo` CHECK (`precioUnitario` >= 0),
  CONSTRAINT `FK_detalles_repuesto_orden`
    FOREIGN KEY (`ordenTrabajoId`) REFERENCES `ordenes_trabajo` (`id`)
    ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT `FK_detalles_repuesto_repuesto`
    FOREIGN KEY (`repuestoId`) REFERENCES `repuestos` (`id`)
    ON DELETE RESTRICT ON UPDATE NO ACTION
) ENGINE=InnoDB;
