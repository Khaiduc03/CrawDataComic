import { uuids4 } from 'src/function/uuid';

export class Comic {
  uuid: string;

  comic_name: string;

  isPublic: boolean;

  author: string;

  description: string;
  views: string;

  image_url: string;

  public_id: string;

  constructor(comic: Partial<Comic>) {
    if (comic) {
      this.uuid = uuids4();
      this.comic_name = comic.comic_name;
      this.isPublic = true;
      this.author = comic.author;
      this.description = comic.description;
      this.views = comic.views;
      this.image_url = comic.image_url;
      this.public_id = comic.public_id;
    }
  }
}
