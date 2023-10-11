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

  async getAllChapter(): Promise<any> {
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
          comic: comic,
          chapter_number: chapters.indexOf(chapter) + 1,
          href: chapter.url,
        });
        await this.chapterRepository.save(newChapter);

        chapterCount++;
      }
    }
  }
}
