import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Image } from 'src/entities/image.entity';
import { ChapterModule } from '../chapter/chapter.module';

@Module({
  imports: [TypeOrmModule.forFeature([Image]), ChapterModule],
  providers: [ImageService],
  controllers: [ImageController],
})
export class ImageModule {}
