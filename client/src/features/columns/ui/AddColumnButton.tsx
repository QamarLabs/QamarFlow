import { Box, Button } from '@chakra-ui/react';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { addColumn } from '../model/columns.slice';

export default function AddColumnButton({ boardId }: { boardId: string }) {
  const dispatch = useAppDispatch();
  const isRequesting = useAppSelector(s => s.columns.isRequesting);

  return (
    <Box rounded="lg" width="272px" flexShrink={0} display="flex" flexDirection="column" mt="10px" mx="10px">
      <Button
        size="xs"
        my="10px"
        mx="5px"
        color="black"
        onClick={() => dispatch(addColumn(boardId))}
        isLoading={isRequesting}
        loadingText="Adding column">
        + Add a Column
      </Button>
    </Box>
  );
}
