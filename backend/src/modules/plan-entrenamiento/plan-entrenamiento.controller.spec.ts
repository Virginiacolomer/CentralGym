import { Test, TestingModule } from '@nestjs/testing';
import { PlanEntrenamientoController } from './plan-entrenamiento.controller';
import { PlanEntrenamientoService } from './plan-entrenamiento.service';

describe('PlanEntrenamientoController', () => {
  let controller: PlanEntrenamientoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanEntrenamientoController],
      providers: [PlanEntrenamientoService],
    }).compile();

    controller = module.get<PlanEntrenamientoController>(PlanEntrenamientoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
