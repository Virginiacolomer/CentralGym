import { Test, TestingModule } from '@nestjs/testing';
import { SeguimientoController } from './seguimiento.controller';
import { SeguimientoService } from './seguimiento.service';

describe('SeguimientoController', () => {
  let controller: SeguimientoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SeguimientoController],
      providers: [SeguimientoService],
    }).compile();

    controller = module.get<SeguimientoController>(SeguimientoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
