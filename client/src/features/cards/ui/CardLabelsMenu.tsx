import { Box, Button, List, ListItem, Menu, MenuButton, MenuItem, MenuList, Text } from '@chakra-ui/react';
import { MdLabelOutline } from 'react-icons/md';
import { CARD_LABELS, type Label } from '../model/types';

type Props = { onSelect: (label: Label | null) => void };

export default function CardLabelsMenu({ onSelect }: Props) {
  return (
    <Box marginTop="2rem" flexDirection="column">
      <Text as="samp" whiteSpace="nowrap">
        ADD TO CARD
      </Text>
      <List spacing={3} p="5px">
        <ListItem>
          <Menu>
            <MenuButton as={Button} leftIcon={<MdLabelOutline />} size="xs" whiteSpace="nowrap">
              Labels
            </MenuButton>
            <MenuList padding="5px">
              {CARD_LABELS.map(item => (
                <MenuItem
                  key={item.type}
                  bg={item.bg}
                  color="white"
                  marginBottom="5px"
                  onClick={() => onSelect(item)}>
                  {item.type}
                </MenuItem>
              ))}
              <MenuItem onClick={() => onSelect(null)}>No label</MenuItem>
            </MenuList>
          </Menu>
        </ListItem>
      </List>
    </Box>
  );
}
