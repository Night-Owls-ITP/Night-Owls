ALTER TABLE `usuarios`
  MODIFY COLUMN `rol` ENUM(
    'administrador',
    'recepcionista',
    'mecanico',
    'inventarista',
    'cajero'
  ) NOT NULL;

ALTER TABLE `usuarios`
  ADD COLUMN `mecanicoId` int NULL,
  ADD UNIQUE KEY `UQ_usuarios_mecanicoId` (`mecanicoId`),
  ADD CONSTRAINT `FK_usuarios_mecanico`
    FOREIGN KEY (`mecanicoId`) REFERENCES `mecanicos` (`id`)
    ON DELETE SET NULL ON UPDATE NO ACTION;
