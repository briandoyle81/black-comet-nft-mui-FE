import {
  Button,
  Card,
  CardContent,
  Box,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  SelectChangeEvent,
} from "@mui/material";
import React, { ReactNode, useEffect, useState } from "react";
import GamePanel, {
  BCEventType,
  DenizenInterface,
  EventTrackerInterface,
  GameInterface,
} from "./GamePanel";
import { Position } from "../utils/Utils";

import { DoorInterface } from "./Doors";
import { ItemDataInterface } from "./ItemCard";

import Door from "./Doors";

import { PlayerInterface } from "./Player";

import Tile, { EmptyTile, GameTileInterface, RoomTile } from "./Tile";

import ChatWindow from "./ChatWindow";

import EventTracker from "./EventTracker";
import EventModal from "./EventModal";
import GameInfoCard from "./GameInfoCard";

import { useContractRead, useContractWrite } from "wagmi";
import { gamesContract } from "../contracts";

import GameLogs from "./GameLogs";

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

export const EffectNames = {
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
  value: bigint;
}

export interface BCEvent {
  id: bigint;
  permanent: boolean;
  rollForLow: bigint; // Unused if zero
  rollForHigh: bigint; // Unused if zero
  defaultEffect: BCEffect[];
  lowEffect: BCEffect[];
  highEffect: BCEffect[];
}

export interface HistoricLog {
  blockNumber: bigint;
  logType: string;
  log: string;
}

export interface CompleteGame {
  game: GameInterface;
  board: GameTileInterface[][];
  doors: DoorInterface[];
  roomTiles: RoomTile[];
  characters: CharInterface[];
  players: PlayerInterface[];
  denizens: DenizenInterface[];
  playerItems: ItemDataInterface[][];
  worldItems: ItemDataInterface[];
  actionsEventBlocks: bigint[];
  gameEventBlocks: bigint[];
  playersEventBlocks: bigint[];
  denizensEventBlocks: bigint[];
}

export default function GameBoard(props: GameBoardProps) {
  const ACTUAL_BOARD_SIZE = 11; // TODO: Hardcoded board size, can't use await here

  const [numGames, setNumGames] = useState(0);

  // TODO: CompleteGame can replace most of the below
  const [completeGame, setCompleteGame] = useState<CompleteGame>({
    game: EmptyGame,
    board: Array.from({ length: ACTUAL_BOARD_SIZE }, () =>
      Array.from({ length: ACTUAL_BOARD_SIZE }, () => EmptyTile)
    ),
    doors: [],
    roomTiles: [],
    characters: [],
    players: [],
    denizens: [],
    playerItems: [],
    worldItems: [],
    actionsEventBlocks: [],
    gameEventBlocks: [],
    playersEventBlocks: [],
    denizensEventBlocks: [],
  });

  const [currentGame, setCurrentGame] = useState<GameInterface>(EmptyGame); // TODO: I don't think i need EmptyGame.  Except I do because I get endless null ref errors even on components that can't render unless game exists
  const [roomTiles, setRoomTiles] = useState<RoomTile[]>([]);
  const [gameTiles, setGameTiles] = useState(
    Array.from({ length: ACTUAL_BOARD_SIZE }, () =>
      Array.from({ length: ACTUAL_BOARD_SIZE }, () => EmptyTile)
    )
  );
  const [doors, setDoors] = useState<DoorInterface[]>([]);
  const [players, setPlayers] = useState<PlayerInterface[]>([]);
  const [chars, setChars] = useState<CharInterface[]>([]);
  const [denizens, setDenizens] = useState<DenizenInterface[]>([]);

  const [currentPlayerItems, setCurrentPlayerItems] = useState<any[]>(); // TODO: Any
  const [gameWorldItems, setGameWorldItems] = useState<ItemDataInterface[]>([]);
  const [roomsWithItems, setRoomsWithItem] = useState<Position[]>([]); // TODO: This should be a set

  const [lastDieRoll, setLastDieRoll] = useState("None");
  const [eventIsLive, setEventIsLive] = useState(false);

  const [renderedTextLogs, setRenderedTextLogs] = useState([
    "Welcome to the Black Comet!",
  ]);

  const [zoomed, setZoomed] = useState(false);
  const [currentPlayerPos, setCurrentPlayerPos] = useState<Position>({
    row: -1,
    col: -1,
  });

  const [debugGameOver, setDebugGameOver] = useState(false);

  // TODO: These should probably use useContractReads
  useContractRead({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "extGetFullGameState",
    args: [props.currentGameNumber],
    watch: true,
    onSettled(data, error) {
      if (data) {
        const gameData = data as CompleteGame;

        setCompleteGame(gameData);
        // console.log(gameData);
        const remoteGame = gameData.game;
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

        setGameTiles(gameData.board);
        setDoors(gameData.doors);
        setRoomTiles(gameData.roomTiles);
        setChars(gameData.characters);
        setPlayers(gameData.players);
        setDenizens(gameData.denizens);
        setCurrentPlayerItems(gameData.playerItems);

        setGameWorldItems(gameData.worldItems);
        // TODO: roomsWithItem should be a set
        const newRoomsWithItem: Position[] = [];
        gameData.worldItems.forEach((item: ItemDataInterface) => {
          newRoomsWithItem.push(item.position);
        });
        setRoomsWithItem(newRoomsWithItem);

        // Block numbers for logs are used from the main completeGame item
      }
      if (error) {
        console.log("error in extGetFullGameState", error);
      }
    },
  });

  useContractRead({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "extGetNumGames",
    args: [],
    // watch: true, // Might need this once, will get after with rest of game data
    onSettled(data, error) {
      if (data) {
        setNumGames(data as number);
      }
      if (error) {
        console.log("error in extGetNumGames", error);
      }
    },
  });

  const { write: forceNextTurn } = useContractWrite({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "forceNextTurn",
  });

  const { write: processDenizenMoves } = useContractWrite({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "processDenizenMoves",
  });

  function renderRowWithDoors(row: number) {
    const rowWithDoors: ReactNode[] = [];
    // gameTiles[row].forEach((tile: GameTileInterface, col) => {
    for (let col = getZoomedColStart(); col < getZoomedColEnd(); col++) {
      const tile = gameTiles[row][col];
      if (col === 0 || col === ACTUAL_BOARD_SIZE - 1) {
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
      if (col < ACTUAL_BOARD_SIZE - 2) {
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
      if (col < ACTUAL_BOARD_SIZE - 1) {
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
      return ACTUAL_BOARD_SIZE; // Not n-1 to render Donghaijiu
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
      return ACTUAL_BOARD_SIZE - 1;
    }
  }

  function renderMapWithDoors() {
    const rows: ReactNode[] = [];
    for (let row = getZoomedRowStart(); row < getZoomedRowEnd(); row++) {
      if (row === 0) {
        return;
      }
      if (row < ACTUAL_BOARD_SIZE - 1) {
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
    if (numGames === 0) {
      return <Box>No games yet!</Box>;
    }

    if (props.currentGameNumber > numGames) {
      return <Box>Selected game does not exist!</Box>;
    }

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
    return roomTiles[currentRoomId].numItems;
  }

  useEffect(() => {
    localStorage.setItem("lastGame", props.currentGameNumber.toString());
  }, [props.currentGameNumber]);

  function handleGameSelectorChange(event: SelectChangeEvent) {
    const gameNum = event.target.value;
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

  function handleEndTurnClick() {
    forceNextTurn({ args: [props.currentGameNumber] });
  }

  function handleDenizenTurnClick() {
    processDenizenMoves({
      args: [props.currentGameNumber],
      // gas: 10_000_000n,
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
        {/* Don't use Zoomed columns below, this reduced the game area*/}
        <Grid container spacing={0} columns={DISPLAY_COLUMNS}>
          <Grid item xs={3}>
            <Card>
              <Grid container>
                <Grid item xs={3}>
                  <Typography variant="body1" align="left">
                    {"Time Left: ???"}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Box alignContent="right">
                    <Button
                      disabled={
                        true
                        // getTurnTimeRemaining()[0] === "-" ? false : true
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
                logs={renderedTextLogs}
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
                      logs={renderedTextLogs}
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
                  logs={renderedTextLogs}
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

  return (
    <Box>
      {renderGameArea()}
      <GameLogs
        currentGameNumber={props.currentGameNumber}
        completeGame={completeGame}
        setLogs={setRenderedTextLogs}
      />
      <ChatWindow content={[...renderedTextLogs]} />
    </Box>
  );
}
