import { v2 } from 'cloudinary';

export const CloudProvider = {
  provide: 'Cloud',
  useFactory: (): void => {
    v2.config({
      cloud_name: 'dxz3irfbf',
      api_key: '936998117639393',
      api_secret: 'WTtUPPb2NQRM-4nE4E9VKRTnYD0',
      
    });
  },
};
