import { Controller, Get, Query } from '@nestjs/common';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  async crawlDataChapter(@Query('otp') opt: string): Promise<any> {
    return await this.imageService.crawlAllImage(opt);
  }

  @Get('do-all')
  async doAll(): Promise<any> {
    return await this.imageService.doAll();
  }

  @Get('no')
  async getChapterWithouImage(): Promise<any> {
    return await this.imageService.getChapterWithouImage();
  }

  @Get('test')
  async test(): Promise<any> {
    return await this.imageService.getChapterWithouImage();
  }
}
