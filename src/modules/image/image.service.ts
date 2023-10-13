import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Image } from 'src/entities/image.entity';
import { Repository } from 'typeorm';
import { ComicService } from '../comic/comic.service';
import { ChapterService } from '../chapter/chapter.service';
import { Manga, MangaType } from 'manga-lib';
const path = require('path');
import * as fs from 'fs';
import { CloudService } from 'src/cloud';
import { Chapter } from 'src/entities/chapter.entity';
import { dummyChapter } from 'src/util/data';
import { randomFrom1To3 } from 'src/function/randomNumber';

@Injectable()
export class ImageService {
  constructor(
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    private comicService: ComicService,
    private chapterService: ChapterService,
    private readonly cloud: CloudService,
  ) {}

  async crawlAllImage(opt: string = '1'): Promise<any> {
    try {
      console.log(opt);
      //  const chapters = await this.chapterService.getAllChapter();
      let chapters: Chapter[] = [];
      if (opt === '2') {
        chapters = await this.getChapterWithouImage();
      } else {
        chapters = await this.chapterService.getAllChapter();
      }

      const manga = new Manga().build(MangaType.TOONILY);

      for (const chapter of chapters) {
        const { chapter_data } = await manga.getDataChapter(chapter.href);

        let imageCount = 0;
        for (const item of chapter_data) {
          if (imageCount >= 40) {
            break;
          }
          await this.comicService.downloadImage2(item.src_origin);
          imageCount++;
        }
        const response = await this.getImagesAndPushToCloudinary();
        for (const itemSave of response) {
          const image = new Image({
            url: itemSave.url,
            public_id: itemSave.public_id,
            chapter: chapter.uuid,
            page: response.indexOf(itemSave) + 1,
          });
          await this.imageRepository.save(image);
        }
        await this.comicService.deleteDataDirectory();
      }

      return 'ok';
    } catch (error) {
      throw error;
    }
  }

  async readImagesFromDataDirectory(): Promise<{
    jpgFiles: string[];
  }> {
    const dataDirectoryPath = path.join(__dirname, '../../../', 'data');

    try {
      const jpgFiles: string[] = [];

      try {
        const files = await fs.promises.readdir(dataDirectoryPath);
        // const jpgFilesInSubdir = files.filter((file) => file);

        jpgFiles.push(
          ...files.map((file) => path.join(dataDirectoryPath, file)),
        );
      } catch (error) {
        // Xử lý lỗi nếu có trong từng thư mục con
        console.error(
          `Không thể đọc tệp hình ảnh từ thư mục con ${dataDirectoryPath}: ${error.message}`,
        );
      }

      console.log(jpgFiles.length);
      return {
        jpgFiles,
      };
    } catch (error) {
      // Xử lý lỗi nếu có
      throw new Error(`Không thể đọc tệp hình ảnh: ${error.message}`);
    }
  }

  async getImagesAndPushToCloudinary(): Promise<
    {
      url: string;
      public_id: string;
    }[]
  > {
    const { jpgFiles } = await this.readImagesFromDataDirectory();
    const response = await this.cloud.uploadImagesToCloudinaryV3(jpgFiles);
    if (!response) {
      throw new Error('Upload failed');
    }

    return response;
  }

  async doAll(): Promise<any> {
    // for (let i = 1; i <= 3; i++) {
    //   await this.comicService.getAndDownLoadImageByPage(i);
    // }
    await this.chapterService.crawlAllChapter();
    await this.crawlAllImage();
  }

  async getChapterWithouImage(): Promise<any> {
    const chapterNoData: Chapter[] = [];
    const chapters = await this.chapterService.getAllChapter();
    //how soft chapters by href
    chapters.sort((a, b) => a.href.localeCompare(b.href));
    for (const chapter of chapters) {
      const images = await this.imageRepository
        .createQueryBuilder('image')
        .leftJoinAndSelect('image.chapter', 'chapter')
        .where('chapter.uuid = :uuid', { uuid: chapter.uuid })
        .getMany();
      // console.log(chapter.uuid);

      if (images.length === 0) {
        chapterNoData.push(chapter);
      }
    }
    console.log(chapterNoData.length);
    return chapterNoData;
  }

  async getChapterWithouImage2(): Promise<any> {
    const chapterNoData: Chapter[] = [];
    const chapters = await this.chapterService.getAllChapter();
    //how soft chapters by href
    chapters.sort((a, b) => a.href.localeCompare(b.href));
    for (const chapter of chapters) {
      const images = await this.imageRepository
        .createQueryBuilder('image')
        .leftJoinAndSelect('image.chapter', 'chapter')
        .where('chapter.uuid = :uuid', { uuid: chapter.uuid })
        .getMany();
      // console.log(chapter.uuid);

      if (images.length > 0) {
        chapterNoData.push(chapter);
      }
    }
    console.log(chapterNoData.length);
    return chapterNoData;
  }

  async getAllImages(page: number): Promise<Image[]> {
    const pageSize = 15000; // Kích thước trang
    const [images] = await this.imageRepository.findAndCount({
      relations: ['chapter'],
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return images;
  }

  async createFastData(): Promise<any> {
    try {
      const chapters = await this.getChapterWithouImage();
      const chapterDummy = [];
      for (const chapter of chapters) {
        const ranmdom = randomFrom1To3();
        let dummyImage = dummyChapter[ranmdom];
        for (const image of dummyImage) {
          const newImage = new Image({
            url: image.url,
            public_id: image.public_id,
            chapter: chapter.uuid,
            page: dummyImage.indexOf(image) + 1,
          });
          await this.imageRepository.save(newImage);
          // chapterDummy.push(newImage);
        }
      }

      return chapterDummy;
    } catch (error) {
      throw error;
    }
  }
}
