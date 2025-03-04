import { EntityRepository, Repository } from 'typeorm';
import { Province } from '../entities/province.entity';

@EntityRepository(Province)
export class ProvinceRepository extends Repository<Province> {}
