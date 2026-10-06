import { BadRequestException } from '@nestjs/common';

export const MAX_DECIMAL_CENTS = 9_999_999_999n;

export function precioACentavos(precio: number | string): bigint {
  const texto = typeof precio === 'number' ? precio.toFixed(2) : precio;
  const coincidencia = /^(\d+)(?:\.(\d{1,2}))?$/.exec(texto);
  if (!coincidencia) {
    throw new BadRequestException('El importe debe tener hasta dos decimales');
  }
  const centavos =
    BigInt(coincidencia[1]) * 100n +
    BigInt((coincidencia[2] ?? '').padEnd(2, '0'));
  if (centavos > MAX_DECIMAL_CENTS) {
    throw new BadRequestException('El importe excede DECIMAL(10,2)');
  }
  return centavos;
}

export function centavosAPrecio(centavos: bigint): string {
  if (centavos < 0n || centavos > MAX_DECIMAL_CENTS) {
    throw new BadRequestException('El total excede DECIMAL(10,2)');
  }
  return `${centavos / 100n}.${(centavos % 100n).toString().padStart(2, '0')}`;
}

export function calcularSubtotal(
  costoUnitario: number | string,
  cantidad: number,
): string {
  return centavosAPrecio(precioACentavos(costoUnitario) * BigInt(cantidad));
}
