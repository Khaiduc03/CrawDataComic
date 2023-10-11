import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloudModule } from './cloud';
import { TypeOrmService } from './database';
import { ComicModule } from './modules/comic/comic.module';
import { ChapterModule } from './modules/chapter/chapter.module';
import { ImageModule } from './modules/image/image.module';

@Module({
  imports: [
    CloudModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmService,
    }),
    ComicModule,
    ChapterModule,
    ImageModule,
  ],
  // controllers: [AppController, ChapterController],
  // providers: [AppService, CloudService, ChapterService],
  // exports: [CloudService, CloudModule],
})
export class AppModule {}
