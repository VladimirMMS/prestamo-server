import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { DocumentGeneric } from './documento.entity';
import { Person } from './person.entity';
import { DocumentTypeEnum } from '../interfaces/tipo-documento.interface';

@Entity('personDocument')
export class PersonDocumento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ enum: DocumentTypeEnum, type: 'enum' })
  documentType: DocumentTypeEnum;

  @OneToOne(() => DocumentGeneric, (document) => document.personDocument)
  @JoinColumn({ name: 'documentId' })
  document: DocumentGeneric;

  @ManyToOne(() => Person, (person) => person.personDocument)
  person: Person;
}
