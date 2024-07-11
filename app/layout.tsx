import React from 'react';
import '@/styles/default.css';

import 'nprogress/nprogress.css';
import { Metadata } from 'next';
import dynamic from 'next/dynamic';

import Header from '@/components/layout/Header';
import { getServerSession } from 'next-auth';
const ChakraProviderWrapper = dynamic(() => import('@/components/layout/ChakraProviderWrapper'), {
  ssr: false
});
const ReduxProviderWrapper = dynamic(() => import('@/components/layout/ReduxProviderWrapper'), {
  ssr: false
});
const SessionProviderWrapper = dynamic(() => import('@/components/layout/SessionProviderWrapper'), {
  ssr: false
});

interface LayoutProps {
  className?: string;
  metadata?: Metadata;
}

export default async function RootLayout({
  children,
  metadata
}: React.PropsWithChildren<LayoutProps>) {
  const session = await getServerSession();
  return (
    <html lang="en">
      <body>
        <SessionProviderWrapper
          session={session}
          refetchInterval={5 * 60}
          refetchWhenOffline={false}>
          <ReduxProviderWrapper>
            <Header metadata={metadata} />
            {/* <NextNprogress color="#0079bf" startPosition={0.3} stopDelayMs={200} height={4} /> */}
            <ChakraProviderWrapper>{children}</ChakraProviderWrapper>
          </ReduxProviderWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
