import { validate } from 'class-validator';
import { CreateCompraDto } from '../../compras/dto/create-compra.dto';
import { UpdateCompraDto } from '../../compras/dto/update-compra.dto';
import { CreateRepuestoDto } from '../../repuestos/dto/create-repuesto.dto';
import { UpdateRepuestoDto } from '../../repuestos/dto/update-repuesto.dto';

describe('DTO de inventario y compras', () => {
  it('rechaza stock en POST/PATCH, incluso cuando es null', async () => {
    const create = Object.assign(new CreateRepuestoDto(), {
      codigo: 'A',
      nombre: 'A',
      descripcion: 'A',
      precioVenta: 1,
      stock: null,
    });
    const update = Object.assign(new UpdateRepuestoDto(), { stock: 2 });

    expect((await validate(create)).map((error) => error.property)).toContain(
      'stock',
    );
    expect((await validate(update)).map((error) => error.property)).toContain(
      'stock',
    );
  });

  it('rechaza total del cliente y null en campos obligatorios de PATCH', async () => {
    const create = Object.assign(new CreateCompraDto(), {
      proveedorId: 1,
      fecha: '2026-10-06',
      total: '0.00',
    });
    const update = Object.assign(new UpdateCompraDto(), { total: 0 });
    const repuesto = Object.assign(new UpdateRepuestoDto(), { nombre: null });

    expect((await validate(create)).map((error) => error.property)).toContain(
      'total',
    );
    expect((await validate(update)).map((error) => error.property)).toContain(
      'total',
    );
    expect((await validate(repuesto)).map((error) => error.property)).toContain(
      'nombre',
    );
  });
});
