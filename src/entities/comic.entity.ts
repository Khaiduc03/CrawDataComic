import { Expose, plainToClass } from 'class-transformer';

import { uuids4 } from 'src/function/uuid';
import { Column, Entity } from 'typeorm';
import { Base } from './base';

@Entity({
  name: Comic.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Comic extends Base {
  @Expose()
  @Column({ type: 'varchar', length: 300, nullable: true })
  comic_name: string;

  @Expose()
  @Column({ type: 'boolean', default: true })
  isPublic: boolean;

  @Expose()
  @Column({ type: 'varchar', length: 300, nullable: true })
  author: string;

  @Expose()
  @Column({
    type: 'text',
    nullable: true,
    default: 'thông tin vẫn đang được cập nhập',
  })
  description: string;

  @Expose()
  @Column({ type: 'integer', nullable: true, default: 0 })
  views: number;

  @Expose()
  @Column({ type: 'varchar', length: 256, default: '' })
  image_url: string;

  @Expose()
  @Column({ type: 'varchar', length: 256, default: '' })
  public_id: string;

  @Expose()
  @Column({ type: 'varchar', length: 256, default: '' })
  href: string;

  constructor(comic: Partial<Comic>) {
    super(); // call constructor of BaseEntity
    if (comic) {
      Object.assign(
        this,
        plainToClass(Comic, comic, { excludeExtraneousValues: true }),
      );
      this.uuid = comic.uuid || uuids4();
    }
  }
}
