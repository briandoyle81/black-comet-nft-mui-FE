import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import GameInfo from './GameInfo';
import { PlayerInterface } from './Player';
import ActionPicker from './ActionPicker';
import { CharInterface } from './Board';
import { Typography } from '@mui/material';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export interface GameInfoInterface {
  currentPlayer: PlayerInterface,
  currentChar: CharInterface,
  currentGameProps: GameInterface,
  currentGameNumber: number,
  playerSignerAddress: string,
  actionsContract_write: any, // TODO: Any
  lastDieRoll: Number
}

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

  gameNumber: number;

  // uint8 currentPlayerTurn;
  // uint8 startPlayerIndex;
}

export default function GamePanel(props: GameInfoInterface) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <GameInfo {...props}/>
        </Grid>
        <Grid item xs={12}>
          <ActionPicker {...props}/>
        </Grid>
        <Grid item xs={12}>
          <Item>xs=4</Item>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            Last Roll:
          </Typography>
          <Typography variant="h3">
            {props.lastDieRoll.toString()}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
