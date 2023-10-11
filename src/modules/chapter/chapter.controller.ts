import { Controller, Get } from '@nestjs/common';
import { ChapterService } from './chapter.service';

@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  @Get()
  async getManga(): Promise<any> {
    return await this.chapterService.crawlAllChapter();
  }
}
