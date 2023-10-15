import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import GamePanel, {
  BCEventType,
  DenizenInterface,
  DenizenType,
  EventTrackerInterface,
  GameInterface,
} from "./GamePanel";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Position } from "../utils/Utils";

import { DoorInterface } from "./Doors";
import { ItemDataInterface } from "./ItemCard";

import Door from "./Doors";

import { PlayerInterface } from "./Player";

import Tile, { EmptyTile, GameTileInterface, RoomTile } from "./Tile";
import { BigNumber } from "ethers";
import { getEventFromId } from "./EventData";
import { Action, ActionString } from "./ActionPicker";
import ChatWindow from "./ChatWindow";

// import actionsContractDeployData from "../deployments/Actions.json";
// import gamesContractDeployData from "../deployments/BCGames.json";
// import playersContractDeployData from "../deployments/BCPlayers.json";
import EventTracker from "./EventTracker";
import EventModal from "./EventModal";
import GameInfoCard from "./GameInfoCard";
import { DenizenTypeToString } from "./Denizen";
import { roomDisplayDataList } from "./RoomTiles";
import {
  useContractRead,
  useContractReads,
  useContractWrite,
  usePublicClient,
} from "wagmi";
import {
  actionsContract,
  gamesContract,
  itemsContract,
  mapsContract,
} from "../contracts";

import { parseAbiItem } from "viem";
import GameLogs from "./GameLogs";

let timesBoardPulled = 0;

const DISPLAY_COLUMNS = 13; // TODO: I really need to refigure out and document the reasoning here
const ZOOMED_COLUMNS = 8;

export enum WorldItemStatus {
  UNKNOWN = 0,
  KNOWN,
  DISCARDED,
  REMOVED,
}

const EmptyEventTracker: EventTrackerInterface = {
  bugEvents: -1,
  mysteryEvents: -1,
  scavEvents: -1,
  shipEvents: -1,
};

export const EmptyGame: GameInterface = {
  active: false,
  denizenTurn: false,

  gameId: -1,

  playerIndexes: [0, 0, 0, 0],
  charIds: [],

  currentPlayerTurnIndex: 0,
  numPlayers: 0,

  turnsTaken: 0,

  eventTracker: EmptyEventTracker,

  mapId: 0,

  eventPlayerId: 0,
  eventNumber: 0,
  eventType: BCEventType.NONE,
  eventPosition: { row: 0, col: 0 },

  unusedBugEvents: [],
  unusedMysteryEvents: [],
  unusedScavEvents: [],
  unusedShipEvents: [],

  turnTimeLimit: 0,
  lastTurnTimestamp: 0,

  denizenIds: [],
};

export interface GameBoardProps {
  currentGameNumber: number;
  playerSignerAddress: string;
  setCurrentGameNumber: Function;
  isConnected: boolean;
}

export interface TraitsInterface {
  health: number;
  carry: number;
  defense: number;
  hack: number;
  breach: number;
  shoot: number;
  melee: number;
}

export interface CharInterface {
  genHash: string; // TODO: Tie to universal inventory
  id: number;
  uifID: number;
  traits: TraitsInterface;
  cloneNumber: number; // High but possibly reachable limit
  maxClones: number; // Eventually exit them from the economy??
  ability: number;
  flaw: number;
  inGame: boolean;
  gameId: number;
}

export enum EffectTypes {
  empty = 0,
  permanant,
  fullHealth,
  instantDeath,
  placeHazard,
  grantEgg,
  healAmt,
  healArmorAmt,
  hazardDamage,
  physicalDamage,
  numEnemyToPlace,
  enemyType,
  whereToPlace,
  grantData,
  grantNumItems,
  takeNumItems,
  dropNumItems, // drop items in the room in unknown state
  moveType,
  trapPlayerEscapeRoll,
  grantAbility,
  loseTurn,
  lockDoorStrength,
  traitModifiersID,
}

const EffectNames = {
  0: "empty,",
  1: "permanant",
  2: "fullHealth",
  3: "instantDeath",
  4: "placeHazard",
  5: "grantEgg",
  6: "healAmt",
  7: "healArmorAmt",
  8: "hazardDamage",
  9: "physicalDamage",
  10: "numEnemyToPlace",
  11: "enemyType",
  12: "whereToPlace",
  13: "grantData",
  14: "grantNumItems",
  15: "takeNumItems",
  16: "dropNumItems,",
  17: "moveType",
  18: "trapPlayerEscapeRoll",
  19: "grantAbility",
  20: "loseTurn",
  21: "lockDoorStrength",
  22: "traitModifiersID",
};

export interface BCEffect {
  effect: EffectTypes;
  value: BigNumber;
}

export interface BCEvent {
  id: BigNumber;
  permanent: boolean;
  rollForLow: BigNumber; // Unused if zero
  rollForHigh: BigNumber; // Unused if zero
  defaultEffect: BCEffect[];
  lowEffect: BCEffect[];
  highEffect: BCEffect[];
}

export interface HistoricLog {
  blockNumber: BigNumber;
  logType: string;
  log: string;
}

export default function GameBoard(props: GameBoardProps) {
  const n = 11; // TODO: Hardcoded board size, can't use await here

  const [numGames, setNumGames] = useState(0);
  const [currentGame, setCurrentGame] = useState<GameInterface>(EmptyGame); // TODO: I don't think i need EmptyGame.  Except I do because I get endless null ref errors even on components that can't render unless game exists
  const [roomTiles, setRoomTiles] = useState<RoomTile[]>([]);
  const [gameTiles, setGameTiles] = useState(
    Array.from({ length: n }, () => Array.from({ length: n }, () => EmptyTile))
  );
  const [doors, setDoors] = useState<DoorInterface[]>([]);
  const [players, setPlayers] = useState<PlayerInterface[]>([]);
  const [chars, setChars] = useState<CharInterface[]>([]);
  const [denizens, setDenizens] = useState<DenizenInterface[]>([]);

  const [currentPlayerItems, setCurrentPlayerItems] = useState<any[]>(); // TODO: Any
  const [gameWorldItems, setGameWorldItems] = useState<ItemDataInterface[]>([]);
  const [roomsWithItems, setRoomsWithItem] = useState<Position[]>([]); // TODO: This should be a set

  const [lastDieRoll, setLastDieRoll] = useState("None");
  // const [eventFlipper, setEventFlipper] = useState(true); // TODO: Confusing name, think this should be actionFlipper

  const [eventIsLive, setEventIsLive] = useState(false);

  const [logs, setLogs] = useState(["Welcome to the Black Comet!"]);

  const [zoomed, setZoomed] = useState(false);
  const [currentPlayerPos, setCurrentPlayerPos] = useState<Position>({
    row: -1,
    col: -1,
  });

  const [debugGameOver, setDebugGameOver] = useState(false);

  // TODO: These should probably use useContractReads
  useContractRead({
    address: itemsContract.address,
    abi: itemsContract.abi,
    functionName: "getWorldItems",
    args: [props.currentGameNumber],
    watch: true,
    onSettled(data, error) {
      if (data) {
        const newWorldItems = data as ItemDataInterface[];
        setGameWorldItems(newWorldItems);

        // TODO: roomsWithItem should be a set
        const newRoomsWithItem: Position[] = [];
        newWorldItems.forEach((item: ItemDataInterface) => {
          newRoomsWithItem.push(item.position);
        });
        setRoomsWithItem(newRoomsWithItem);
      }
      if (error) {
        console.log("error in getWorldItems", error);
      }
    },
  });

  useContractRead({
    address: itemsContract.address,
    abi: itemsContract.abi,
    functionName: "getAllPlayersItems",
    args: [props.currentGameNumber],
    watch: true,
    onSettled(data, error) {
      if (data) {
        setCurrentPlayerItems(data as ItemDataInterface[][]);
      }
      if (error) {
        console.log("error in getAllPlayersItems", error);
      }
    },
  });

  useContractRead({
    address: mapsContract.address,
    abi: mapsContract.abi,
    functionName: "extGetBoard",
    args: [props.currentGameNumber],
    watch: true,
    onSettled(data, error) {
      if (data) {
        setGameTiles(data as GameTileInterface[][]);
      }
      if (error) {
        console.log("error in extGetBoard", error);
      }
    },
  });

  useContractRead({
    address: mapsContract.address,
    abi: mapsContract.abi,
    functionName: "extGetRoomList", //TODO: Investigate if this is still useful
    args: [props.currentGameNumber],
    watch: true, // TODO: Might not need to watch this
    onSettled(data, error) {
      if (data) {
        setRoomTiles(data as RoomTile[]);
      }
      if (error) {
        console.log("error in extGetRoomList", error);
      }
    },
  });

  useContractRead({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "extGetCharsInGame",
    args: [props.currentGameNumber],
    watch: true, // TODO: Might not need to watch this
    onSettled(data, error) {
      if (data) {
        setChars(data as CharInterface[]);
      }
      if (error) {
        console.log("error in extGetCharsInGame", error);
      }
    },
  });

  useContractRead({
    address: mapsContract.address,
    abi: mapsContract.abi,
    functionName: "extGetDoors",
    args: [props.currentGameNumber],
    watch: true,
    onSettled(data, error) {
      if (data) {
        setDoors(data as DoorInterface[]);
      }
      if (error) {
        console.log("error in extGetDoors", error);
      }
    },
  });

  useContractRead({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "extGetPlayersInGame",
    args: [props.currentGameNumber],
    watch: true,
    onSettled(data, error) {
      if (data) {
        setPlayers(data as PlayerInterface[]);
        // console.log("players", data);
      }
      if (error) {
        console.log("error in extGetPlayersInGame", error);
      }
    },
  });

  useContractRead({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "extGetNumGames",
    args: [],
    watch: true,
    onSettled(data, error) {
      if (data) {
        setNumGames(data as number);
      }
      if (error) {
        console.log("error in extGetNumGames", error);
      }
    },
  });

  useContractRead({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "extGetGame",
    args: [props.currentGameNumber],
    watch: true,
    onSettled(data, error) {
      if (data) {
        const remoteGame = data as GameInterface;
        // console.log("remoteGame", remoteGame.eventNumber);
        // console.log("CurrentGame", currentGame.eventNumber);

        if (remoteGame.currentPlayerTurnIndex) {
          setCurrentPlayerPos({
            row: players[remoteGame.currentPlayerTurnIndex].position.row,
            col: players[remoteGame.currentPlayerTurnIndex].position.col,
          });
        }

        if (remoteGame.eventNumber > 0) {
          setEventIsLive(true);
        } else {
          setEventIsLive(false);
        }

        setCurrentGame({ ...remoteGame });
        if (remoteGame.active === false) {
          setDebugGameOver(true);
        }
      }
      if (error) {
        console.log("error in games", error);
      }
    },
  });

  useContractRead({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "getDenizensInGame",
    args: [props.currentGameNumber],
    watch: true,
    onSettled(data, error) {
      if (data && currentGame.gameId !== -1) {
        setDenizens(data as DenizenInterface[]);
      }
      if (error) {
        console.log("error in getDenizensInGame", error);
      }
    },
  });

  const {
    data: forceNextTurnData,
    isLoading: forceNextTurnIsLoading,
    error: forceNextTurnError,
    write: forceNextTurn,
  } = useContractWrite({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "forceNextTurn",
  });

  const {
    data: processDenizenMovesData,
    isLoading: processDenizenMovesIsLoading,
    error: processDenizenMovesError,
    write: processDenizenMoves,
  } = useContractWrite({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "processDenizenMoves",
  });

  function renderRowWithDoors(row: number) {
    const rowWithDoors: ReactNode[] = [];
    // gameTiles[row].forEach((tile: GameTileInterface, col) => {
    for (let col = getZoomedColStart(); col < getZoomedColEnd(); col++) {
      const tile = gameTiles[row][col];
      if (col === 0 || col === n - 1) {
        return;
      }
      const itemKey = row + "," + col;
      rowWithDoors.push(
        <Grid item xs={1} key={itemKey}>
          <Tile
            tile={tile}
            players={players}
            chars={chars}
            row={row}
            col={col}
            currentGame={currentGame}
            denizens={denizens}
            roomTiles={roomTiles}
            roomsWithItems={roomsWithItems}
          />
        </Grid>
      );
      // Don't render the last door.  -2 because other process skips outer ring
      if (col < n - 2) {
        rowWithDoors.push(
          <Door
            vsBreach={doors[tile.doors[2]].vsBreach}
            vsHack={doors[tile.doors[2]].vsHack}
            status={doors[tile.doors[2]].status}
            rotate={true}
            key={itemKey + "-door-id-" + tile.doors[2]}
          />
        );
      }
    }
    return rowWithDoors;
  }

  // Render N/S doors based on the south door of each tile
  function renderRowOfDoors(row: number) {
    const rowOfDoors: ReactNode[] = [];
    // Start with a small, empty item to offset doors for alignment
    rowOfDoors.push(
      <Grid item xs={0.25} key={row + "-starter"}>
        <Card></Card>
      </Grid>
    );
    // gameTiles[row].forEach((tile: GameTileInterface, col) => {
    // if (col === 0 || col === n - 1) {
    //   return;
    // }
    for (let col = getZoomedColStart(); col < getZoomedColEnd(); col++) {
      const tile = gameTiles[row][col];
      const itemKey = row + "," + col;
      rowOfDoors.push(
        <Door
          vsBreach={doors[tile.doors[1]].vsBreach}
          vsHack={doors[tile.doors[1]].vsHack}
          status={doors[tile.doors[1]].status}
          rotate={false}
          key={itemKey + "-door-id-" + tile.doors[1]}
        />
      );

      // Push an "empty" card to maintain grid, except the last
      if (col < n - 1) {
        rowOfDoors.push(
          <Grid item xs={1} key={row + "," + col + "-empty"}>
            <Card></Card>
          </Grid>
        );
      }
    }

    return rowOfDoors;
  }

  function getZoomedRowStart() {
    if (zoomed) {
      if (currentPlayerPos.row <= 3) {
        return 1;
      } else if (currentPlayerPos.row >= 8) {
        return 6;
      } else {
        return currentPlayerPos.row - 2;
      }
    } else {
      return 1;
    }
  }

  function getZoomedRowEnd() {
    if (zoomed) {
      if (currentPlayerPos.row <= 3) {
        return 5;
      } else if (currentPlayerPos.row >= 8) {
        return 11;
      } else {
        return currentPlayerPos.row + 3; // + 2 for desired rows and 1 for < in other loop
      }
    } else {
      return n; // Not n-1 to render Donghaijiu
    }
  }

  function getZoomedColStart() {
    if (zoomed) {
      if (currentPlayerPos.col <= 3) {
        return 1;
      } else if (currentPlayerPos.col >= 8) {
        return 6;
      } else {
        return currentPlayerPos.col - 2;
      }
    } else {
      return 1;
    }
  }

  function getZoomedColEnd() {
    if (zoomed) {
      if (currentPlayerPos.col <= 3) {
        return 5;
      } else if (currentPlayerPos.col >= 8) {
        return 10;
      } else {
        return currentPlayerPos.col + 3;
      }
    } else {
      return n - 1;
    }
  }

  function renderMapWithDoors() {
    const rows: ReactNode[] = [];
    // gameTiles.forEach((rowData: GameTileInterface[], row) => {
    for (let row = getZoomedRowStart(); row < getZoomedRowEnd(); row++) {
      const rowData = gameTiles[row];
      if (row === 0) {
        return;
      }
      if (row < n - 1) {
        rows.push(
          <Box key={row + "-withDoors"}>
            <Grid
              container
              spacing={0}
              columns={zoomed ? ZOOMED_COLUMNS : DISPLAY_COLUMNS}
            >
              {renderRowWithDoors(row)}
            </Grid>
            <Grid
              container
              spacing={0}
              columns={zoomed ? ZOOMED_COLUMNS : DISPLAY_COLUMNS}
            >
              {renderRowOfDoors(row)}
            </Grid>
          </Box>
        );
      } else {
        // Don't print a row of doors at the bottom
        rows.push(
          <Box key={row + "-withDoors"}>
            <Grid
              container
              spacing={0}
              columns={zoomed ? ZOOMED_COLUMNS : DISPLAY_COLUMNS}
            >
              {renderRowWithDoors(row)}
            </Grid>
          </Box>
        );
      }
    }
    return rows;
  }

  function renderMapArea() {
    // if (numGames === 0) {
    //   return (
    //     <Box>No games yet!</Box>
    //   )
    // }

    if (props.currentGameNumber > numGames) {
      return <Box>Selected game does not exist!</Box>;
    }

    // return !gameLoaded ? (
    //   "Loading..."
    // ) : (
    //   <Card>
    //     <CardContent>
    //       <Box sx={{ flexGrow: 1 }}>{renderMapWithDoors()}</Box>
    //     </CardContent>
    //   </Card>
    // );
    return (
      <Card>
        <CardContent>
          <Box sx={{ flexGrow: 1 }}>{renderMapWithDoors()}</Box>
        </CardContent>
      </Card>
    );
  }

  function getNumItems() {
    if (currentGame.gameId === -1) {
      return 0;
    }
    const currentPlayer = players[currentGame.currentPlayerTurnIndex];
    const currentRoomId =
      gameTiles[currentPlayer.position.row][currentPlayer.position.col].roomId;
    // console.log("there are this many items:", roomTiles[currentRoomId].numItems)
    // console.log(typeof(roomTiles[currentRoomId].numItems))

    return roomTiles[currentRoomId].numItems;
  }

  useEffect(() => {
    localStorage.setItem("lastGame", props.currentGameNumber.toString());
  }, [props.currentGameNumber]);

  function handleGameSelectorChange(event: SelectChangeEvent) {
    const gameNum = event.target.value;
    // setGameLoaded(false); Happens above now
    // localStorage.setItem("lastGame", gameNum.toString());
    props.setCurrentGameNumber(gameNum);
  }

  function buildGamesDropDown() {
    const menuItems: ReactNode[] = [];
    for (let i = 0; i < numGames; i++) {
      menuItems.push(
        <MenuItem key={"games-dd-" + i} value={i}>
          {i}
        </MenuItem>
      );
    }
    return menuItems;
  }

  // TODO: Rewrite all of this
  function getSecondsRemaining() {
    // TODO: Figure out this insanity.  Why are they behaving as strings when added, type of object, but think they're numbers, when they're bigNumbers?
    // const endOfTurnSeconds: number =
    //   parseInt(currentGame.lastTurnTimestamp.toString()) +
    //   parseInt(currentGame.turnTimeLimit.toString());
    // return dateInSeconds - endOfTurnSeconds;
  }

  function getTurnTimeRemaining() {
    // const remaining = getSecondsRemaining();

    // const negative = remaining <= 0 ? "" : "-";
    // return negative + fancyTimeFormat(Math.abs(remaining)); // TODO: Minutes and seconds
    return "???";
  }

  function fancyTimeFormat(duration: number) {
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";

    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;

    return ret;
  }

  function getTimeColor() {
    const secondsRemaining = -getSecondsRemaining();

    if (secondsRemaining < 0) {
      return "red";
    } else if (secondsRemaining < 60) {
      return "yellow";
    } else {
      return "white";
    }
  }

  function handleEndTurnClick() {
    forceNextTurn({ args: [props.currentGameNumber] });
  }

  function handleDenizenTurnClick() {
    processDenizenMoves({
      args: [props.currentGameNumber],
      // gas: BigInt(10_000_000),
    });
  }

  function renderGameArea() {
    if (debugGameOver) {
      return "Game is over.  Will add seeing old games later";
    }
    return !(
      currentGame.gameId !== -1 &&
      roomTiles.length > 0 &&
      doors.length > 0
    ) ? (
      "Loading Game Area..."
    ) : (
      <Box>
        <Grid container spacing={0} columns={DISPLAY_COLUMNS}>
          <Grid item xs={3}>
            <Card>
              <Grid container>
                <Grid item xs={3}>
                  <Typography variant="body1" align="left" color={getTimeColor}>
                    {/* {"Time Left: " + getTurnTimeRemaining()} */}
                    {"Time Left: ???"}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Box alignContent="right">
                    <Button
                      disabled={
                        getTurnTimeRemaining()[0] === "-" ? false : true
                      }
                      onClick={handleEndTurnClick}
                    >
                      Skip Player
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box alignContent="right">
                    <Button
                      disabled={!currentGame.denizenTurn}
                      onClick={handleDenizenTurnClick}
                    >
                      Denizen Turn
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box alignContent="right">
                    <Button
                      onClick={() => {
                        setZoomed(!zoomed);
                      }}
                    >
                      {zoomed ? "Zoom Out" : "Zoom In"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              <GamePanel
                currentPlayer={players[currentGame.currentPlayerTurnIndex]}
                currentChar={chars[currentGame.currentPlayerTurnIndex]}
                currentGameProps={currentGame}
                denizens={denizens}
                currentGameNumber={props.currentGameNumber}
                playerSignerAddress={props.playerSignerAddress}
                lastDieRoll={lastDieRoll}
                setLastDieRoll={setLastDieRoll}
                numItems={getNumItems()}
                allHeldItems={currentPlayerItems}
                roomTiles={roomTiles}
                players={players}
                chars={chars}
                currentTile={
                  gameTiles[
                    players[currentGame.currentPlayerTurnIndex].position.row
                  ][players[currentGame.currentPlayerTurnIndex].position.col]
                }
                eventIsLive={eventIsLive}
                setEventIsLive={setEventIsLive}
                roomsWithItems={roomsWithItems}
                gameWorldItems={gameWorldItems}
                logs={logs}
              />
            </Card>
          </Grid>
          <Grid item xs={9}>
            <Grid container spacing={0}>
              <Grid item xs={6}>
                <EventTracker currentGameProps={currentGame} />
              </Grid>
              <Grid item xs={3}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <EventModal
                      currentPlayer={
                        players[currentGame.currentPlayerTurnIndex]
                      }
                      currentChar={chars[currentGame.currentPlayerTurnIndex]}
                      currentGameProps={currentGame}
                      denizens={denizens}
                      currentGameNumber={props.currentGameNumber}
                      playerSignerAddress={props.playerSignerAddress}
                      lastDieRoll={lastDieRoll}
                      setLastDieRoll={setLastDieRoll}
                      numItems={getNumItems()}
                      allHeldItems={currentPlayerItems}
                      roomTiles={roomTiles}
                      players={players}
                      chars={chars}
                      currentTile={
                        gameTiles[
                          players[currentGame.currentPlayerTurnIndex].position
                            .row
                        ][
                          players[currentGame.currentPlayerTurnIndex].position
                            .col
                        ]
                      }
                      eventIsLive={eventIsLive}
                      setEventIsLive={setEventIsLive}
                      roomsWithItems={roomsWithItems}
                      gameWorldItems={gameWorldItems}
                      logs={logs}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <FormControl fullWidth>
                        <InputLabel id="game-selector-label">
                          Change Game
                        </InputLabel>
                        <Select
                          labelId="game-selector-dd-label"
                          id="game-selector-dd"
                          value={props.currentGameNumber.toString()}
                          onChange={handleGameSelectorChange}
                        >
                          {buildGamesDropDown()}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <GameInfoCard
                  currentPlayer={players[currentGame.currentPlayerTurnIndex]}
                  currentChar={chars[currentGame.currentPlayerTurnIndex]}
                  currentGameProps={currentGame}
                  denizens={denizens}
                  currentGameNumber={props.currentGameNumber}
                  playerSignerAddress={props.playerSignerAddress}
                  lastDieRoll={lastDieRoll}
                  setLastDieRoll={setLastDieRoll}
                  numItems={getNumItems()}
                  allHeldItems={currentPlayerItems}
                  roomTiles={roomTiles}
                  players={players}
                  chars={chars}
                  currentTile={
                    gameTiles[
                      players[currentGame.currentPlayerTurnIndex].position.row
                    ][players[currentGame.currentPlayerTurnIndex].position.col]
                  }
                  eventIsLive={eventIsLive}
                  setEventIsLive={setEventIsLive}
                  roomsWithItems={roomsWithItems}
                  gameWorldItems={gameWorldItems}
                  logs={logs}
                />
              </Grid>
              <Grid item xs={12}>
                {renderMapArea()}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    );
  }
  // ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] used to debug ChatWindow below
  return (
    <Box>
      {renderGameArea()}
      <GameLogs currentGameNumber={props.currentGameNumber} setLogs={setLogs} />
      <ChatWindow content={[...logs]} />
    </Box>
  );
}
