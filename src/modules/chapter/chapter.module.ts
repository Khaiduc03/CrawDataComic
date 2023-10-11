import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudService } from 'src/cloud';
import { Chapter } from 'src/entities/chapter.entity';
import { Comic } from 'src/entities/comic.entity';
import { ComicService } from '../comic/comic.service';
import { ChapterController } from './chapter.controller';
import { ChapterService } from './chapter.service';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter, Comic])],
  controllers: [ChapterController],
  providers: [ChapterService, CloudService, ComicService],
  exports: [ChapterService, CloudService, ComicService, TypeOrmModule],
})
export class ChapterModule {}
