import { useRouter } from 'next/router';

export const useDynamicRouter = () => {
  const router = useRouter();
  
  return {
    ...router,
    buildPath: (path) => path,
    pushDynamic: router.push,
    replaceDynamic: router.replace,
    pathPrefix: ''
  };
};