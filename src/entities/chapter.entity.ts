import { Expose, plainToClass } from 'class-transformer';

import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './base';
import { Comic } from './comic.entity';
import { uuids4 } from 'src/function/uuid';

@Entity({
  name: Chapter.name.toLowerCase(),
  orderBy: {
    chapter_number: 'ASC',
  },
})
export class Chapter extends Base {
  @Expose()
  @ManyToOne(() => Comic, (comic) => comic.uuid)
  @JoinColumn({ name: 'comic', referencedColumnName: 'uuid' })
  comic: string;

  @Expose()
  @Column({ type: 'varchar', length: 300, nullable: true })
  chapter_name: string;

  @Expose()
  @Column({ type: 'integer', nullable: true })
  chapter_number: number;

  @Expose()
  @Column({ type: 'integer', nullable: true, default: 0 })
  views: number;

  @Expose()
  @Column({ type: 'varchar', length: 256, default: '' })
  href: string;

  constructor(chapter: Partial<Chapter>) {
    super(); // call constructor of BaseEntity
    if (chapter) {
      Object.assign(
        this,
        plainToClass(Chapter, chapter, { excludeExtraneousValues: true }),
      );
      this.uuid = chapter.uuid || uuids4();
    }
  }
}
