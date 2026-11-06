import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js'; // Subir 2 niveles desde modules/implementos
import { EstadoPrestamo } from '@prisma/client';
import { randomUUID } from 'crypto';
import {
  CreateImplementoDto,
  SolicitarPrestamoDto,
} from './dto/create-implemento.dto.js';

@Injectable()
export class ImplementosService {
  constructor(private readonly prisma: PrismaService) {}

  // RF-09: Crear un nuevo implemento en el inventario
  async crearImplemento(dto: CreateImplementoDto) {
    return this.prisma.implemento.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        stockTotal: dto.stockTotal,
        stockDisponible: dto.stockTotal, // Al crear, todo el stock está disponible
        categoria: dto.categoria,
      },
    });
  }

  // RF-09: Catálogo de Inventario en Tiempo Real
  async obtenerInventario() {
    return this.prisma.implemento.findMany();
  }

  // RF-10: Solicitud de Préstamo con Código QR
  async solicitarPrestamo(dto: SolicitarPrestamoDto) {
    // 1. Validar si el usuario está sancionado (RF-12)
    const usuario = await this.prisma.usuario.findUnique({
      where: { id: dto.usuarioId },
    });
    if (!usuario) {
      throw new NotFoundException('El usuario no existe.');
    }
    if (usuario.estado === 'SANCIONADO') {
      throw new BadRequestException(
        'El usuario se encuentra sancionado por préstamos vencidos.',
      );
    }

    // 2. Transacción atómica: verificar stock y crear préstamo
    return this.prisma.$transaction(async (tx) => {
      const implemento = await tx.implemento.findUnique({
        where: { id: dto.implementoId },
      });
      if (!implemento || implemento.stockDisponible <= 0) {
        throw new BadRequestException(
          'No hay existencias disponibles para este implemento.',
        );
      }

      // Descontar 1 del stock disponible
      await tx.implemento.update({
        where: { id: dto.implementoId },
        data: { stockDisponible: implemento.stockDisponible - 1 },
      });

      // Generar token único para el código QR
      const tokenQr = `PRESTAMO-${randomUUID()}`;

      return tx.prestamo.create({
        data: {
          usuarioId: dto.usuarioId,
          implementoId: dto.implementoId,
          tokenQr,
          estado: EstadoPrestamo.SOLICITADO,
        },
        include: { implemento: true },
      });
    });
  }

  // RF-10: Procesar entrega escaneando el código QR (Acción del Encargado CAU)
  async entregarImplementoPorQr(tokenQr: string) {
    const prestamo = await this.prisma.prestamo.findUnique({
      where: { tokenQr },
    });
    if (!prestamo || prestamo.estado !== EstadoPrestamo.SOLICITADO) {
      throw new BadRequestException(
        'El código QR es inválido o la solicitud ya fue procesada.',
      );
    }

    const fechaLimite = new Date();
    fechaLimite.setHours(fechaLimite.getHours() + 2); // 2 horas límite por defecto

    return this.prisma.prestamo.update({
      where: { id: prestamo.id },
      data: {
        estado: EstadoPrestamo.EN_PRESTAMO,
        fechaEntrega: new Date(),
        fechaLimite,
      },
    });
  }

  // RF-11: Registrar Devolución e Incrementar Stock
  async registrarDevolucion(prestamoId: number) {
    return this.prisma.$transaction(async (tx) => {
      const prestamo = await tx.prestamo.findUnique({
        where: { id: prestamoId },
      });
      if (!prestamo || prestamo.estado !== EstadoPrestamo.EN_PRESTAMO) {
        throw new BadRequestException(
          'El préstamo no está activo o ya fue devuelto.',
        );
      }

      // Reponer 1 en el stock disponible
      await tx.implemento.update({
        where: { id: prestamo.implementoId },
        data: { stockDisponible: { increment: 1 } },
      });

      // Actualizar estado a DEVUELTO
      return tx.prestamo.update({
        where: { id: prestamoId },
        data: {
          estado: EstadoPrestamo.DEVUELTO,
          fechaDevolucion: new Date(),
        },
      });
    });
  }
}
