import { Expose } from 'class-transformer';
import { BaseEntity, Column, PrimaryGeneratedColumn } from 'typeorm';

export class Base extends BaseEntity {
  @Expose()
  @PrimaryGeneratedColumn('uuid')
  uuid: string;

  @Expose()
  @Column({ type: 'date', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Expose()
  @Column({
    type: 'date',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;

  @Expose()
  @Column({ type: 'date', default: null })
  deleted_at: Date;

  constructor() {
    super();
  }
}
