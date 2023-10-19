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

  async createDummyTopic(): Promise<any> {
    const topics = [];
    const response = await this.getImagesAndPushToCloudinary();
    const nameTopcis = [
      'action',
      'comedy',
      'drama',
      'fantasy',
      'sports',
      'mystery',
      'romance',
      'thriller',
      'school',
      'horny',
    ];
    const description = [
      'Action is a genre of fiction in which violence plays a major role. Action stories usually involve a hero who fights a villain or commits heroic deeds',
      'Comedy is a genre of fiction in which the main emphasis is on humor. These stories are built around comic characters, situations and events.',
      'Drama is a genre of fiction in which the main emphasis is on human emotion and relationships. These stories are designed to evoke strong feelings from the reader.',
      'Fantasy is a genre of fiction in which the main emphasis is on the imagination. These stories are designed to entertain the reader and take them to another world.',
      'Sports is a genre of fiction in which the main emphasis is on sports. These stories are designed to entertain the reader and take them to another world.',
      'Mystery is a genre of fiction in which the main emphasis is on mystery. These stories are designed to entertain the reader and take them to another world.',
      'Romance is a genre of fiction in which the main emphasis is on romance. These stories are designed to entertain the reader and take them to another world.',
      'Thriller is a genre of fiction in which the main emphasis is on thriller. These stories are designed to entertain the reader and take them to another world.',
      'School is a genre of fiction in which the main emphasis is on school. These stories are designed to entertain the reader and take them to another world.',
      'Horny is a genre of fiction in which the main emphasis is on horny. These stories are designed to entertain the reader and take them to another world.',
    ];

    for (const item of response) {
      const topic = {
        name: nameTopcis[response.indexOf(item)],
        description: description[response.indexOf(item)],
        image: item.url,
        public_id: item.public_id,
      };
      topics.push(topic);
    }
    return topics;
  }

  async doAll(): Promise<any> {
    for (let i = 1; i <= 3; i++) {
      await this.comicService.getAndDownLoadImageByPage(i);
    }
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

  async getChapterHaveImage2(): Promise<any> {
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
