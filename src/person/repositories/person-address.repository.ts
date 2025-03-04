import { EntityRepository, Repository } from 'typeorm';
import { PersonAddress } from '../entities/person-address.entity';

@EntityRepository(PersonAddress)
export class PersonAddressRepository extends Repository<PersonAddress> {}
