import { ReactNode } from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import GameInfo from './GameInfo';
import { PlayerInterface } from './Player';
import ActionPicker from './ActionPicker';
import { CharInterface, IWorldItem } from './Board';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { isPropertySignature } from 'typescript';
import ItemCard from './ItemCard';
import EventModal from './EventModal';
import { Position } from './Utils';
import { GameTileInterface, RoomTile, TilePropsInterface } from './Tile';
import Inventory from './Inventory';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export enum BCEventType {NONE=0, BUG, MYSTERY, SCAVENGER, SHIP_SECURITY, ROOM}

export interface GameInfoInterface {
  currentPlayer: PlayerInterface,
  currentChar: CharInterface,
  currentGameProps: GameInterface,
  currentGameNumber: number,
  playerSignerAddress: string,
  actionsContract_write: any, // TODO: Any
  gameContract_write: any,
  lastDieRoll: string,
  setLastDieRoll: Function,
  numItems: number, // number of items in the current room
  allHeldItems: any, // TODO: any
  roomTiles: RoomTile[],
  players: PlayerInterface[],
  chars: CharInterface[],
  currentTile: GameTileInterface,
  setEventFlipper: Function,
  eventResolved: boolean,
  setEventResolved: Function,
  roomsWithItems: Position[],
  gameWorldItems: IWorldItem[]
}

export interface EventTrackerInterface {
  bugEvents: number;
  mysteryEvents: number;
  scavEvents: number;
  shipEvents: number;
}

export interface GameInterface {

  active: boolean;

  playerIndexes: number[];
  currentPlayerTurnIndex: number;
  numPlayers: number;
  // uint256[] itemIDs; // Items in (owned by) the game

  turnsTaken: number;

  eventTracker: EventTrackerInterface;

  mapContract: string; // TODO: Handle if game contract changes!!!!
  mapId: number;

  eventPlayerId: number;
  eventNumber: number;
  eventType: BCEventType;
  eventPosition: Position;

  gameNumber: number;
}

export default function GamePanel(props: GameInfoInterface) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="body1">
            Roll:
          </Typography>
          <Typography variant="h3">
            {props.lastDieRoll.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <GameInfo {...props}/>
        </Grid>
        <Grid item xs={12}>
          <EventModal {...props}/>
        </Grid>
        <Grid item xs={12}>
          <ActionPicker {...props}/>
        </Grid>
        <Grid item xs={12}>
          {Inventory(props)}
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardHeader
              title="Game Info"
            />
            <CardContent>
              <Grid container spacing={1}>
                <Grid item xs={9}>
                  <Typography variant="body1" align="left">
                    Game #:
                  </Typography>
                  <Typography variant="body1" align="left">
                    Current Player:
                  </Typography>
                  <Typography variant="body1" align="left">
                    Id Number:
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="body1">
                    {props.currentGameNumber}
                  </Typography>
                  <Typography variant="body1">
                    {props.currentGameProps.currentPlayerTurnIndex.toString()}
                  </Typography>
                  <Typography variant="body1">
                    {props.currentChar.id.toString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
