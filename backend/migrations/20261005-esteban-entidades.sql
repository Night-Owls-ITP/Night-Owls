CREATE TABLE IF NOT EXISTS `mecanicos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `documento` varchar(50) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `especialidad` varchar(100) NOT NULL,
  `activo` tinyint NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UQ_mecanicos_documento` (`documento`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `servicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` varchar(500) NOT NULL,
  `precioBase` decimal(10,2) NOT NULL,
  `activo` tinyint NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `detalles_servicio` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ordenTrabajoId` int NOT NULL,
  `servicioId` int NOT NULL,
  `cantidad` int NOT NULL,
  `precioUnitario` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `IDX_detalles_servicio_ordenTrabajoId` (`ordenTrabajoId`),
  KEY `IDX_detalles_servicio_servicioId` (`servicioId`),
  CONSTRAINT `FK_detalles_servicio_ordenTrabajo`
    FOREIGN KEY (`ordenTrabajoId`) REFERENCES `ordenes_trabajo` (`id`)
    ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT `FK_detalles_servicio_servicio`
    FOREIGN KEY (`servicioId`) REFERENCES `servicios` (`id`)
    ON DELETE RESTRICT ON UPDATE NO ACTION
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS `citas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `vehiculoId` int NOT NULL,
  `fechaHora` datetime NOT NULL,
  `motivo` varchar(500) NOT NULL,
  `estado` enum('pendiente','confirmada','cancelada','atendida')
    NOT NULL DEFAULT 'pendiente',
  `ordenTrabajoId` int NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `REL_citas_ordenTrabajoId` (`ordenTrabajoId`),
  KEY `IDX_citas_vehiculoId` (`vehiculoId`),
  CONSTRAINT `FK_citas_vehiculo`
    FOREIGN KEY (`vehiculoId`) REFERENCES `vehiculos` (`id`)
    ON DELETE RESTRICT ON UPDATE NO ACTION,
  CONSTRAINT `FK_citas_ordenTrabajo`
    FOREIGN KEY (`ordenTrabajoId`) REFERENCES `ordenes_trabajo` (`id`)
    ON DELETE SET NULL ON UPDATE NO ACTION
) ENGINE=InnoDB;

ALTER TABLE `ordenes_trabajo`
  ADD COLUMN `mecanicoId` int NULL,
  ADD KEY `IDX_ordenes_trabajo_mecanicoId` (`mecanicoId`),
  ADD CONSTRAINT `FK_ordenes_trabajo_mecanico`
    FOREIGN KEY (`mecanicoId`) REFERENCES `mecanicos` (`id`)
    ON DELETE SET NULL ON UPDATE NO ACTION;
