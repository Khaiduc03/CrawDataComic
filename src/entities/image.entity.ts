import { Expose, plainToClass } from 'class-transformer';
import { uuids4 } from 'src/function/uuid';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Base } from './base';
import { Chapter } from './chapter.entity';

@Entity({
  name: Image.name.toLowerCase(),
  orderBy: {
    created_at: 'ASC',
  },
})
export class Image extends Base {
  @Expose()
  @Column({ type: 'varchar', length: 300, nullable: true })
  public_id: string;

  @Expose()
  @Column({ type: 'varchar', length: 300, nullable: true })
  url: string;

  @Expose()
  @Column({ type: 'varchar', length: 300, nullable: true })
  secure_url: string;

  @Expose()
  @Column({ type: 'int', nullable: true })
  page: number;

  @Expose()
  @ManyToOne(() => Chapter, (chapter) => chapter.uuid)
  @JoinColumn({ name: 'chapter_uuid', referencedColumnName: 'uuid' })
  chapter: string;

  constructor(image: Partial<Image>) {
    super();
    if (image) {
      Object.assign(
        this,
        plainToClass(Image, image, {
          excludeExtraneousValues: true,
        })
      );
      this.uuid = image.uuid || uuids4();
    }
  }
}
