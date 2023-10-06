import { v2 } from 'cloudinary';

export const CloudProvider = {
  provide: 'Cloud',
  useFactory: (): void => {
    v2.config({
      cloud_name: 'demvtgvo4',
      api_key: '325114566867761',
      api_secret: 'CIUSIsyU6bPg_BcFFEDiTuKkZBQ',
      secure: true,
    });
  },
};
