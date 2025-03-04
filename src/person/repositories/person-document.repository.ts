import { EntityRepository, Repository } from 'typeorm';
import { PersonDocumento } from '../entities/person-documento.entity';

@EntityRepository(PersonDocumento)
export class PersonDocumentoRepository extends Repository<PersonDocumento> {}
