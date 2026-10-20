USE night_owls;

CREATE TABLE IF NOT EXISTS `auditoria` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `tabla_afectada` varchar(100) NOT NULL,
  `registro_id` bigint NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `accion` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `fecha_hora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `datos_anteriores` json NULL,
  `datos_nuevos` json NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

DELIMITER $$

CREATE TRIGGER trg_auditoria_repuestos_update
AFTER UPDATE ON `repuestos`
FOR EACH ROW
BEGIN
  INSERT INTO `auditoria` (
    `tabla_afectada`,
    `registro_id`,
    `usuario`,
    `accion`,
    `datos_anteriores`,
    `datos_nuevos`
  )
  VALUES (
    'repuestos',
    OLD.id,
    USER(),
    'UPDATE',
    JSON_OBJECT(
      'id', OLD.id,
      'codigo', OLD.codigo,
      'nombre', OLD.nombre,
      'descripcion', OLD.descripcion,
      'stock', OLD.stock,
      'precioVenta', OLD.precioVenta,
      'activo', OLD.activo
    ),
    JSON_OBJECT(
      'id', NEW.id,
      'codigo', NEW.codigo,
      'nombre', NEW.nombre,
      'descripcion', NEW.descripcion,
      'stock', NEW.stock,
      'precioVenta', NEW.precioVenta,
      'activo', NEW.activo
    )
  );
END$$

CREATE TRIGGER trg_auditoria_pagos_insert
AFTER INSERT ON `pagos`
FOR EACH ROW
BEGIN
  INSERT INTO `auditoria` (
    `tabla_afectada`,
    `registro_id`,
    `usuario`,
    `accion`,
    `datos_anteriores`,
    `datos_nuevos`
  )
  VALUES (
    'pagos',
    NEW.id,
    USER(),
    'INSERT',
    NULL,
    JSON_OBJECT(
      'id', NEW.id,
      'valor', NEW.valor,
      'fecha', NEW.fecha,
      'metodo', NEW.metodo,
      'referencia', NEW.referencia,
      'facturaId', NEW.facturaId
    )
  );
END$$

DELIMITER ;
