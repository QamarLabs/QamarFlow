import { Metadata } from 'next';
import dynamic from 'next/dynamic';
const WelcomeScreen = dynamic(() => import('@/components/welcome-screen'), { ssr: false });

export const metadata: Metadata = {
  title: 'QamarFlow'
};

async function ServerWelcomeScreen() {
  return (
    <div>
      <WelcomeScreen />
    </div>
  );
}

export default ServerWelcomeScreen;
