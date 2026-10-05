import { BadRequestException } from '@nestjs/common';

export function precioACentavos(precio: number | string): bigint {
  const texto = typeof precio === 'number' ? precio.toFixed(2) : precio;
  const coincidencia = /^(\d+)(?:\.(\d{1,2}))?$/.exec(texto);
  if (!coincidencia) {
    throw new BadRequestException('El precio debe tener hasta dos decimales');
  }
  const enteros = BigInt(coincidencia[1]);
  const centavos = BigInt((coincidencia[2] ?? '').padEnd(2, '0'));
  return enteros * 100n + centavos;
}

export function centavosAPrecio(centavos: bigint): string {
  return `${centavos / 100n}.${(centavos % 100n).toString().padStart(2, '0')}`;
}

export function calcularSubtotal(
  precioUnitario: number | string,
  cantidad: number,
): string {
  return centavosAPrecio(precioACentavos(precioUnitario) * BigInt(cantidad));
}
