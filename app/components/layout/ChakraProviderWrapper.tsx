'use client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: '#B440EB',
    success: '#70b500',
    danger: '#eb5a46',
    info: '#ff9f1a',
    warning: '#f2d600',
    darkblue: '#eae6ff',
    lightblue: '#f2faf9',
    performance: '#0079bf',
    bug: '#eb5a46',
    feature: '#61bd4f',
    information: '#ff9f1a'
  }
});

export default function ChakraProviderWrapper(props: React.PropsWithChildren<any>) {
  return <ChakraProvider theme={theme}>{props.children}</ChakraProvider>;
}
