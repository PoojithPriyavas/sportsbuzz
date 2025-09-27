import { useRouter } from 'next/router';

export const usePathHelper = () => {
  return {
    pathPrefix: '',
    buildPath: (path) => path
  };
};