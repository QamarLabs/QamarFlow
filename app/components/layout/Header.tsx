import { Metadata } from 'next';

interface HeaderProps {
  metadata: Metadata | undefined;
}

function Header({ metadata }: HeaderProps) {
  return (
    <>
      <div className="mx-auto max-h-screen overflow-hidden lg:max-w-6xl">
        <meta name="description" content="Qamar Project Management" />
        <link rel="shortcut icon" href="/qamarflow-icon.svg"></link>
      </div>
    </>
  );
}

export default Header;
