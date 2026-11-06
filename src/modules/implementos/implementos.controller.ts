import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { ImplementosService } from './implementos.service.js';
import {
  CreateImplementoDto,
  SolicitarPrestamoDto,
  EntregarQrDto,
} from './dto/create-implemento.dto.js';

@Controller('implementos')
export class ImplementosController {
  constructor(private readonly implementosService: ImplementosService) {}

  // RF-09: Agregar implemento al catálogo (Admin/Encargado)
  @Post()
  crear(@Body() createImplementoDto: CreateImplementoDto) {
    return this.implementosService.crearImplemento(createImplementoDto);
  }

  // RF-09: Ver catálogo de inventario
  @Get()
  obtenerInventario() {
    return this.implementosService.obtenerInventario();
  }

  // RF-10: Solicitar un implemento (Genera QR)
  @Post('solicitar')
  solicitar(@Body() dto: SolicitarPrestamoDto) {
    return this.implementosService.solicitarPrestamo(dto);
  }

  // RF-10: Confirmar entrega mediante escaneo de QR
  @Post('entregar-qr')
  entregarPorQr(@Body() dto: EntregarQrDto) {
    return this.implementosService.entregarImplementoPorQr(dto.tokenQr);
  }

  // RF-11: Registrar la devolución de un implemento
  @Post('devolver/:id')
  registrarDevolucion(@Param('id', ParseIntPipe) id: number) {
    return this.implementosService.registrarDevolucion(id);
  }
}
