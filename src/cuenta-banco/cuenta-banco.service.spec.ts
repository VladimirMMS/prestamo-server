import { Test, TestingModule } from '@nestjs/testing';
import { CuentaBancoService } from './cuenta-banco.service';

describe('CuentaBancoService', () => {
  let service: CuentaBancoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CuentaBancoService],
    }).compile();

    service = module.get<CuentaBancoService>(CuentaBancoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
