import { Button } from '@chakra-ui/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type QamarFlowLinkProps = {
  href: string;
};

function QamarFlowLink({ children, href }: React.PropsWithChildren<QamarFlowLinkProps>) {
  const router = useRouter();

  return (
    <Link
      href={href}
      onClick={e => {
        e.stopPropagation();
        router.push(href);
      }}>
      {children}
    </Link>
  );
}

export default QamarFlowLink;
