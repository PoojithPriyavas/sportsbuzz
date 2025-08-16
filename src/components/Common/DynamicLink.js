import Link from 'next/link';
import { usePathHelper } from '@/hooks/usePathHelper';

const DynamicLink = ({ href, children, ...props }) => {
  const { buildPath } = usePathHelper();
  
  const dynamicHref = buildPath(href);
  
  return (
    <Link href={dynamicHref} {...props}>
      {children}
    </Link>
  );
};

export default DynamicLink;