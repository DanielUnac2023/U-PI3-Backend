import { Test, TestingModule } from '@nestjs/testing';
import { ImplementosController } from './implementos.controller.js';
import { ImplementosService } from './implementos.service.js';

describe('ImplementosController', () => {
  let controller: ImplementosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ImplementosController],
      providers: [ImplementosService],
    }).compile();

    controller = module.get<ImplementosController>(ImplementosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
