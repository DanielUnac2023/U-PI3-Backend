import { Test, TestingModule } from '@nestjs/testing';
import { ImplementosService } from './implementos.service.js';

describe('ImplementosService', () => {
  let service: ImplementosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImplementosService],
    }).compile();

    service = module.get<ImplementosService>(ImplementosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
