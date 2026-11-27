import { AuthForm } from '@/features/auth';
import Header from '@/widgets/header/Header';

export default function LoginPage() {
  return (
    <>
      <Header title="Log in" />
      <AuthForm mode="login" />
    </>
  );
}
