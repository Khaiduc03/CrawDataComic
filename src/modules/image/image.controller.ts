import { Controller, Get, Query } from '@nestjs/common';
import { ImageService } from './image.service';
import { Image } from 'src/entities/image.entity';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  @Get()
  async crawlDataChapter(@Query('otp') opt: string): Promise<any> {
    console.log(opt);
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

  @Get('all')
  async getAllComic(@Query('page') page: string): Promise<any> {
    return await this.imageService.getAllImages(Number(page));
  }

  @Get('test')
  async test() {
    return await this.imageService.getChapterWithouImage2();
  }

  @Get('fast')
  async createFastData() {
    return await this.imageService.createFastData();
  }
}
