import { EntityRepository, Repository } from 'typeorm';
import { DocumentGeneric } from '../entities/documento.entity';

@EntityRepository(DocumentGeneric)
export class DocumentGenericRepository extends Repository<DocumentGeneric> {}
