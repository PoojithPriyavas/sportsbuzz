import Link from 'next/link';
import { usePathHelper } from '@/hooks/usePathHelper';

const DynamicLink = ({ href = '/', children, ...props }) => {
  const { buildPath } = usePathHelper();
  
  // Ensure we're using the buildPath function to construct the URL with language-country code
  // Add a default value to prevent undefined href
  const dynamicHref = buildPath(href);
  
  // // For debugging
  // console.log('Original href:', href);
  // console.log('Dynamic href with language prefix:', dynamicHref);
  
  return (
    <Link href={dynamicHref} {...props}>
      {children}
    </Link>
  );
};

export default DynamicLink;