import { AuthForm } from '@/features/auth';
import Header from '@/widgets/header/Header';

export default function RegisterPage() {
  return (
    <>
      <Header title="Sign up" />
      <AuthForm mode="register" />
    </>
  );
}
