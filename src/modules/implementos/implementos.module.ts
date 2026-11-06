import { Module } from '@nestjs/common';
import { ImplementosService } from './implementos.service.js';
import { ImplementosController } from './implementos.controller.js';

@Module({
  controllers: [ImplementosController],
  providers: [ImplementosService],
})
export class ImplementosModule {}
