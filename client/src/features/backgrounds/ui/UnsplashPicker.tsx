import { useState, type FormEvent } from 'react';
import { Box, Button, Input, InputGroup, InputRightElement, Link, Text } from '@chakra-ui/react';
import { errorMessage } from '@/shared/lib/errors';
import { backgroundsApi, type ImageRef } from '../api/backgrounds.api';

type Props = { selected?: string | null; onSelect: (url: string) => void };

export default function UnsplashPicker({ selected, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [images, setImages] = useState<ImageRef[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (q: string, p: number, append: boolean) => {
    setLoading(true);
    setError(null);
    try {
      const result = await backgroundsApi.search(q || 'nature', p);
      setImages(prev => (append ? [...prev, ...result] : result));
      setPage(p);
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    load(query, 1, false);
  };

  return (
    <>
      <form onSubmit={onSearch}>
        <InputGroup>
          <Input placeholder="Search Photos" value={query} onChange={e => setQuery(e.target.value)} />
          <InputRightElement width="4.5rem">
            <Button size="sm" type="submit">
              Search
            </Button>
          </InputRightElement>
        </InputGroup>
      </form>
      {error && (
        <Text color="red.500" mt="2" fontSize="sm">
          {error}
        </Text>
      )}
      <Box display="flex" flexWrap="wrap" marginTop="20px" justifyContent="center">
        {images.map(item => (
          <Box key={item.id} mr="10px" mb="10px" textAlign="center">
            <Box
              role="button"
              aria-label={item.author ? `Photo by ${item.author}` : 'Background photo'}
              cursor="pointer"
              backgroundImage={`url('${item.thumbUrl}')`}
              backgroundSize="cover"
              borderRadius="lg"
              height="150px"
              width="150px"
              outline={selected === item.url ? '3px solid' : undefined}
              outlineColor="brand"
              onClick={() => onSelect(item.url)}
            />
            {item.author && (
              <Link href={item.authorLink} isExternal fontSize="xs">
                {item.author}
              </Link>
            )}
          </Box>
        ))}
      </Box>
      <Box display="flex" justifyContent="center" mt="20px">
        <Button
          onClick={() => load(query, images.length ? page + 1 : 1, images.length > 0)}
          size="xs"
          isLoading={loading}
          loadingText="Loading Images...">
          {images.length ? 'Load more' : 'Show photos'}
        </Button>
      </Box>
    </>
  );
}
