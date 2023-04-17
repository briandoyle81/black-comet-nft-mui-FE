import * as React from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import { ItemDataInterface } from './ItemCard';

interface ItemSelectorInterface {
  charId: number;
  items: ItemDataInterface[];
  addToSelectedItems: Function;
  removeFromSelectedItems: Function;
  clearChoices: boolean;
  resetClear: Function;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, personName: readonly string[], theme: Theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

export default function ItemSelector(props: ItemSelectorInterface) {
  const theme = useTheme();
  const [itemName, setItemName] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (props.clearChoices) {
      setItemName([]);
      props.resetClear();
    }
  }, [props.clearChoices])

  const handleChange = (event: SelectChangeEvent<typeof itemName>) => {
    const {
      target: { value },
    } = event;
    setItemName(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
    console.log("VALUE", value);
  };

  return (
    <div>
      <FormControl sx={{ m: 1, width: '95%' }}>
        <InputLabel id="item-chip-label">Items</InputLabel>
        <Select
          labelId="item-chip-label"
          id="item-chip"
          multiple
          value={itemName}
          onChange={handleChange}
          input={<OutlinedInput id="item-chip" label="Chip" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {props.items.map((item) => (
            <MenuItem
              key={item.genHash.slice(4, 8) + "/" + item.id.toString()}
              value={parseInt(item.id.toString())}
              style={getStyles(item.genHash.slice(4, 8) + "/" + item.id.toString(), itemName, theme)}
            >
              {item.genHash.slice(4, 8) + "/" + item.id.toString()}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}
