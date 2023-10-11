import { Controller, Get, ParseIntPipe, Query } from '@nestjs/common';
import { ComicService } from './comic.service';

@Controller('comic')
export class ComicController {
  constructor(private readonly comicService: ComicService) {}

  @Get('avatar')
  async getLast_Page(@Query('page', ParseIntPipe) page: number): Promise<any> {
    return await this.comicService.getAndDownLoadImageByPage(page);
  }
}
