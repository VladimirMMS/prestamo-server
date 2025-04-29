import { Test, TestingModule } from '@nestjs/testing';
import { PrestamoController } from './prestamo.controller';
import { PrestamoService } from './prestamo.service';

describe('PrestamoController', () => {
  let controller: PrestamoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PrestamoController],
      providers: [PrestamoService],
    }).compile();

    controller = module.get<PrestamoController>(PrestamoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
