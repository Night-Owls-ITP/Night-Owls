import { ConflictException } from '@nestjs/common';

export function lanzarConflictoDeIntegridad(error: unknown): never {
  const driverError =
    typeof error === 'object' && error !== null && 'driverError' in error
      ? (error as { driverError?: { code?: string; errno?: number } })
          .driverError
      : (error as { code?: string; errno?: number } | null)?.code
        ? (error as { code?: string; errno?: number })
        : undefined;
  if (
    driverError?.code === 'ER_DUP_ENTRY' ||
    driverError?.code === 'ER_NO_REFERENCED_ROW_2' ||
    driverError?.code === 'ER_ROW_IS_REFERENCED_2' ||
    driverError?.errno === 1062 ||
    driverError?.errno === 1451 ||
    driverError?.errno === 1452
  ) {
    throw new ConflictException(
      'Conflicto con un registro o relación existente',
    );
  }
  throw error;
}
