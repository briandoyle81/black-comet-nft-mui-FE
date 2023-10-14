import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Grid from "@mui/material/Grid";
import GameInfo from "./GameInfo";
import { PlayerInterface } from "./Player";
import ActionPicker from "./ActionPicker";
import { CharInterface } from "./Board";
import { ItemDataInterface } from "./ItemCard";
import { Position } from "./Utils";
import { GameTileInterface, RoomTile } from "./Tile";
import Inventory from "./Inventory";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export enum BCEventType {
  NONE = 0,
  BUG,
  MYSTERY,
  SCAVENGER,
  SHIP_SECURITY,
  ROOM,
}
export enum DenizenType {
  NONE = 0,
  BUG,
  SCAV,
  TURRET,
  ROBOT,
  QUEEN,
  BUTCHER,
  BEHEMOTH,
  DOCTOR,
}

export interface GameInfoInterface {
  currentPlayer: PlayerInterface;
  currentChar: CharInterface;
  currentGameProps: GameInterface;
  denizens: DenizenInterface[];
  currentGameNumber: number;
  playerSignerAddress: string;
  lastDieRoll: string;
  setLastDieRoll: Function;
  numItems: number; // number of items in the current room
  allHeldItems: any; // TODO: any
  roomTiles: RoomTile[];
  players: PlayerInterface[];
  chars: CharInterface[];
  currentTile: GameTileInterface;
  eventIsLive: boolean;
  setEventIsLive: Function;
  roomsWithItems: Position[];
  gameWorldItems: ItemDataInterface[];
  logs: string[];
}

export interface DenizenInterface {
  id: BigInt;
  gameId: BigInt;
  denizenType: DenizenType; // Traits are derived from type

  position: Position;

  healthRemaining: BigInt;
}

export interface EventTrackerInterface {
  bugEvents: number;
  mysteryEvents: number;
  scavEvents: number;
  shipEvents: number;
}

export interface GameInterface {
  active: boolean;
  denizenTurn: boolean;

  gameId: number;

  playerIndexes: number[];
  charIds: number[];

  currentPlayerTurnIndex: number;
  numPlayers: number;

  turnsTaken: number;

  eventTracker: EventTrackerInterface;

  mapId: number;

  eventPlayerId: number;
  eventNumber: number;
  eventType: BCEventType;
  eventPosition: Position;

  unusedBugEvents: number[];
  unusedMysteryEvents: number[];
  unusedScavEvents: number[];
  unusedShipEvents: number[];

  turnTimeLimit: number;
  lastTurnTimestamp: number;

  denizenIds: number[];
  // Extras not in smart contract type

  // denizens?: DenizenInterface[];
}

export default function GamePanel(props: GameInfoInterface) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <ActionPicker {...props} />
        </Grid>
        <Grid item xs={12}>
          <GameInfo {...props} />
        </Grid>
        <Grid item xs={12}>
          {Inventory(props)}
        </Grid>
      </Grid>
    </Box>
  );
}
