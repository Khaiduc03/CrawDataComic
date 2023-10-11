import { Controller, Get } from '@nestjs/common';
import { ImageService } from './image.service';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  async crawlDataChapter(): Promise<any> {
    return await this.imageService.crawlAllImage();
  }

  @Get('do-all')
  async doAll(): Promise<any> {
    return await this.imageService.doAll();
  }

  @Get('no')
  async getChapterWithouImage(): Promise<any> {
    return await this.imageService.getChapterWithouImage();
  }
}
