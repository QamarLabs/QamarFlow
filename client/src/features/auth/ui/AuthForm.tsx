import { useEffect, useState, type FormEvent } from 'react';
import {
  Alert,
  AlertDescription,
  AlertIcon,
  Box,
  Button,
  Flex,
  FormControl,
  Image,
  Input,
  Link,
  Text
} from '@chakra-ui/react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { clearAuthError, login, register } from '../model/auth.slice';

type Mode = 'login' | 'register';

/** Email + password form shared by the login and register pages. */
export default function AuthForm({ mode }: { mode: Mode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { status, error } = useAppSelector(s => s.auth);
  const [values, setValues] = useState({
    fullName: '',
    email: params.get('email') ?? '',
    password: ''
  });

  useEffect(() => {
    dispatch(clearAuthError());
  }, [mode, dispatch]);

  const next = params.get('next');
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/home';

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const action =
      mode === 'login'
        ? await dispatch(login({ email: values.email, password: values.password }))
        : await dispatch(register(values));
    if (action.meta.requestStatus === 'fulfilled') navigate(safeNext, { replace: true });
  };

  const isLogin = mode === 'login';
  const otherQuery = params.toString() ? `?${params.toString()}` : '';
  const art = isLogin
    ? { left: '/login/left.svg', right: '/login/right.svg' }
    : { left: '/signup/sign-up-left.svg', right: '/signup/sign-up-right.svg' };

  return (
    <>
      <Box display="flex" justifyContent="center" alignItems="center" my="40px">
        <Image height="20px" mt="2" src="/qamarflow-icon.svg" alt="brand logo" />
        <Text fontWeight="bold" fontSize="28px" m="4px">
          QamarFlow
        </Text>
      </Box>
      <Flex alignItems="center" justifyContent="center">
        <Image position="absolute" bottom="5%" left="5%" src={art.left} alt="" width={[0, '30%']} />
        <Image position="absolute" bottom="5%" right="5%" src={art.right} alt="" width={[0, '30%']} />
        <Box
          p="25px 40px"
          width={['80%', '60%', '45%', '25%']}
          borderRadius="3px"
          bg="white"
          zIndex={1}
          boxShadow="rgb(0 0 0 / 10%) 0 0 10px">
          <Text textAlign="center" color="#5E6C84" mt="5" mb="25px" fontSize="20px" fontWeight="semibold">
            {isLogin ? 'Log in to QamarFlow' : 'Sign up for your account'}
          </Text>
          <form onSubmit={onSubmit}>
            {!isLogin && (
              <FormControl mb={6} isRequired>
                <Input
                  name="fullName"
                  value={values.fullName}
                  placeholder="Enter full name"
                  onChange={e => setValues({ ...values, fullName: e.target.value })}
                />
              </FormControl>
            )}
            <FormControl isRequired>
              <Input
                type="email"
                name="email"
                value={values.email}
                placeholder="Enter email"
                autoComplete="email"
                onChange={e => setValues({ ...values, email: e.target.value })}
              />
            </FormControl>
            <FormControl mt={6} isRequired>
              <Input
                type="password"
                name="password"
                value={values.password}
                placeholder="Enter password"
                minLength={isLogin ? undefined : 8}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                onChange={e => setValues({ ...values, password: e.target.value })}
              />
            </FormControl>
            <Button
              type="submit"
              width="full"
              mt={4}
              bg="success"
              color="white"
              isLoading={status === 'pending'}
              loadingText={isLogin ? 'Logging in' : 'Signing up'}>
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
            <Box m="5" textAlign="center">
              <Link as={RouterLink} to={`${isLogin ? '/register' : '/login'}${otherQuery}`} color="brand" p="2">
                {isLogin ? 'Sign up for an account' : 'Already have an account? Log in'}
              </Link>
            </Box>
            {error && (
              <Alert status="error">
                <AlertIcon />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </form>
        </Box>
      </Flex>
    </>
  );
}
