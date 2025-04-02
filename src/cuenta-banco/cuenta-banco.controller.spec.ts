import { Test, TestingModule } from '@nestjs/testing';
import { CuentaBancoController } from './cuenta-banco.controller';
import { CuentaBancoService } from './cuenta-banco.service';

describe('CuentaBancoController', () => {
  let controller: CuentaBancoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CuentaBancoController],
      providers: [CuentaBancoService],
    }).compile();

    controller = module.get<CuentaBancoController>(CuentaBancoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
