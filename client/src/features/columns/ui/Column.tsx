import { useMemo, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  Box,
  Heading,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Text
} from '@chakra-ui/react';
import { AiOutlineDelete, AiOutlineEdit } from 'react-icons/ai';
import { FiMoreHorizontal } from 'react-icons/fi';
import { GrDrag } from 'react-icons/gr';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import debounce from 'lodash.debounce';
import { useAppDispatch } from '@/app/hooks';
import { deleteColumn, renameColumn } from '../model/columns.slice';
import type { Column as ColumnModel } from '../model/types';

type Props = {
  column: ColumnModel;
  index: number;
  /** Cards (Draggables) rendered inside this column's Droppable. */
  children: ReactNode;
  /** Footer under the droppable area, e.g. the "add card" button. */
  footer?: ReactNode;
};

export default function Column({ column, index, children, footer }: Props) {
  const dispatch = useAppDispatch();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(column.name);

  const saveName = useMemo(
    () =>
      debounce((value: string) => {
        if (value.trim())
          dispatch(renameColumn({ boardId: column.boardId, columnId: column.id, name: value.trim() }));
      }, 800),
    [dispatch, column.boardId, column.id]
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setEditing(false);
    }
  };

  const handleDelete = () => {
    if (window.confirm(`Delete column "${column.name}" and its cards?`))
      dispatch(deleteColumn({ boardId: column.boardId, columnId: column.id }));
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {provided => (
        <Box
          width="272px"
          height="calc(100vh - 90px)"
          overflowY="auto"
          mt="10px"
          mx="10px"
          flexShrink={0}
          {...provided.draggableProps}
          ref={provided.innerRef}>
          <Box bg="#F0F0F0" pb="5px" rounded="lg">
            <Box display="flex" alignItems="center" justifyContent="space-between">
              {editing ? (
                <Input
                  bg="white"
                  value={name}
                  size="xs"
                  width="60%"
                  ml="20px"
                  autoFocus
                  onChange={e => {
                    setName(e.target.value);
                    saveName(e.target.value);
                  }}
                  onBlur={() => setEditing(false)}
                  onKeyDown={handleKeyDown}
                />
              ) : (
                <Heading {...provided.dragHandleProps} as="h6" size="sm" ml="10px" mt="5px">
                  <Box display="flex" alignItems="center" gap="4px">
                    <GrDrag /> {name}
                  </Box>
                </Heading>
              )}
              <Box my="10px" mr="10px" display="flex">
                <Menu>
                  <MenuButton aria-label="Column options">
                    <FiMoreHorizontal />
                  </MenuButton>
                  <MenuList>
                    <MenuItem onClick={() => setEditing(v => !v)}>
                      <AiOutlineEdit />
                      <Text marginLeft="5px">Edit</Text>
                    </MenuItem>
                    <MenuDivider />
                    <MenuItem onClick={handleDelete}>
                      <AiOutlineDelete />
                      <Text marginLeft="5px">Delete</Text>
                    </MenuItem>
                  </MenuList>
                </Menu>
              </Box>
            </Box>
            <Droppable droppableId={column.id} type="card">
              {drop => (
                // min height keeps the drop target alive when the column is empty
                <Box ref={drop.innerRef} {...drop.droppableProps} minHeight="8px">
                  {children}
                  {drop.placeholder}
                </Box>
              )}
            </Droppable>
            {footer}
          </Box>
        </Box>
      )}
    </Draggable>
  );
}
