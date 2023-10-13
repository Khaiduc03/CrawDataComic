import { Controller, Get } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { Chapter } from 'src/entities/chapter.entity';

@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Get()
  async getManga(): Promise<any> {
    return await this.chapterService.crawlAllChapter();
  }

  @Get('all')
  async getAllComic(): Promise<Chapter[]> {
    return await this.chapterService.getAllChapter();
  }

  @Get('test')
  async getAllComic2(): Promise<any> {
    return await this.chapterService.crawlAllChapter2();
  }
}
