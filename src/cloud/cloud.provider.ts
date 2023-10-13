import { v2 } from 'cloudinary';

export const CloudProvider = {
  provide: 'Cloud',
  useFactory: (): void => {
    v2.config({
      cloud_name: 'dpfzq4fig',
      api_key: '111317431833318',
      api_secret: 'rABmHwRmu75LM7CiWcuMiBsoXSk',
    });
  },
};
