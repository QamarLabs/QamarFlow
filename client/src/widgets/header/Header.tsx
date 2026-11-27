import { useEffect } from 'react';

/** Sets the document title (replaces Next metadata). */
export default function Header({ title }: { title?: string }) {
  useEffect(() => {
    document.title = title ? `${title} | QamarFlow` : 'QamarFlow';
  }, [title]);
  return null;
}
