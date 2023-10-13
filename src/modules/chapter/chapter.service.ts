import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Manga, MangaType } from 'manga-lib';
import { Chapter } from 'src/entities/chapter.entity';
import { Repository } from 'typeorm';
import { ComicService } from '../comic/comic.service';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private chapterRepository: Repository<Chapter>,
    private comicService: ComicService,
  ) {}

  async crawlAllChapter(): Promise<any> {
    const comics = await this.comicService.getComics();
    if (!comics) return undefined;
    const manga = new Manga().build(MangaType.TOONILY);
    for (const comic of comics) {
      const { chapters } = await manga.getDetailManga(comic.href);
      chapters.reverse();
      let chapterCount = 0;

      for (const chapter of chapters) {
        if (chapterCount >= 50) {
          break;
        }
        const newChapter = new Chapter({
          chapter_name: chapter.title,
          comic: comic.uuid,
          chapter_number: chapters.indexOf(chapter) + 1,
          href: chapter.url,
        });
        await this.chapterRepository.save(newChapter);

        chapterCount++;
      }
    }
  }

  async getAllChapter(): Promise<Chapter[]> {
    return await this.chapterRepository
      .createQueryBuilder('chapter')
      .leftJoinAndSelect('chapter.comic', 'comic')
      .getMany();
  }

  async crawlAllChapter2(): Promise<any> {
    const arr = [];
    const comics = await this.comicService.getComics();
    if (!comics) return undefined;
    const manga = new Manga().build(MangaType.TOONILY);
    const targetChapter = 10;
    for (const comic of comics) {
      const { chapters } = await manga.getDetailManga(comic.href);
      chapters.reverse();
      const filteredChapters = chapters.filter(chapter => {
        const chapterNumber = parseInt(chapter.title.match(/\d+/)?.[0] || '0', 10);
        return chapterNumber > targetChapter;
    });
    

      let chapterCount = 0;

      for (const chapter of filteredChapters) {
        if (chapterCount >= 40) {
          break;
        }
        const newChapter = new Chapter({
          chapter_name: chapter.title,
          comic: comic.uuid,
          chapter_number: chapters.indexOf(chapter) + 1,
          href: chapter.url,
        });
         await this.chapterRepository.save(newChapter);
        //arr.push(newChapter);
        chapterCount++;
      }
    }
    return arr;
  }
}
