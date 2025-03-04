import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PersonDocumento } from './person-documento.entity';

@Entity('documentGeneric')
export class DocumentGeneric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  route: string;

  @Column()
  tipo: number;

  @Column()
  extension: string;

  @Column()
  createdAt: Date;

  @OneToOne(() => PersonDocumento, (personDocument) => personDocument.document)
  personDocument: PersonDocumento;
}
