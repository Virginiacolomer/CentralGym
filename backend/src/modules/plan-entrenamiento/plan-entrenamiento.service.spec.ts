import { Test, TestingModule } from '@nestjs/testing';
import { PlanEntrenamientoService } from './plan-entrenamiento.service';

describe('PlanEntrenamientoService', () => {
  let service: PlanEntrenamientoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanEntrenamientoService],
    }).compile();

    service = module.get<PlanEntrenamientoService>(PlanEntrenamientoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
