import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comic } from 'src/entities/comic.entity';
import { ComicController } from './comic.controller';
import { ComicService } from './comic.service';
import { CloudService } from 'src/cloud';

@Module({
  imports: [TypeOrmModule.forFeature([Comic])],
  controllers: [ComicController],
  providers: [ComicService, CloudService],
  exports: [ComicService, CloudService],
})
export class ComicModule {}
