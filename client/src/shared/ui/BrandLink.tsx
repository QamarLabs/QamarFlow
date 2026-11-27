import { Link as RouterLink, type LinkProps } from 'react-router-dom';

export default function BrandLink({ children, ...props }: LinkProps) {
  return (
    <RouterLink {...props} onClick={e => e.stopPropagation()}>
      {children}
    </RouterLink>
  );
}
