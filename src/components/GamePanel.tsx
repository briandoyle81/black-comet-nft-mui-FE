import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import GameInfo from './GameInfo';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export interface GameInterface {
  // TODO: Should games just always be 3 or 4 players???
  active: boolean;

  playerIndexes: number[];
  currentPlayerTurnIndex: number;
  numPlayers: number;
  // uint256[] itemIDs; // Items in (owned by) the game

  turnsTaken: number;

  // EventTracker eventTracker;

  mapContract: string; // TODO: Handle if game contract changes!!!!
  mapId: number;

  // uint8 currentPlayerTurn;
  // uint8 startPlayerIndex;
}

export default function GamePanel() {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <GameInfo />
      <Grid container spacing={2}>
        <Grid item xs={8}>
          <Item>xs=8</Item>
        </Grid>
        <Grid item xs={4}>
          <Item>xs=4</Item>
        </Grid>
        <Grid item xs={4}>
          <Item>xs=4</Item>
        </Grid>
        <Grid item xs={8}>
          <Item>xs=8</Item>
        </Grid>
      </Grid>
    </Box>
  );
}
