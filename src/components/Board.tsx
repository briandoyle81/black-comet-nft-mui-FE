import { Button, Card, CardContent, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import GamePanel, { BCEventType, EventTrackerInterface, GameInterface } from './GamePanel';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { DoorInterface } from './Doors';

import Door from "./Doors";

import { PlayerInterface } from './Player';

import Tile, { EmptyRoomTile, EmptyTile, GameTileInterface, RoomTile } from './Tile';

let timesBoardPulled = 0;

const DISPLAY_COLUMNS = 13;

const EmptyEventTracker: EventTrackerInterface = {
  bugEvents: -1,
  mysteryEvents: -1,
  scavEvents: -1,
  shipEvents: -1
}

export const EmptyGame: GameInterface = {
  active: false,

  playerIndexes: [0, 0, 0, 0],
  currentPlayerTurnIndex: 0,
  numPlayers: 0,

  turnsTaken: 0,

  eventTracker: EmptyEventTracker,

  mapContract: "",
  mapId: 0,

  eventPlayerId: 0,
  eventNumber: 0,
  eventType: BCEventType.NONE,
  eventPosition: {row: 0, col: 0},

  gameNumber: -1
}

export interface GameBoardProps {
  currentGameNumber: number;
  mapContract_read: any;  // TODO anys
  gameContract_read: any;
  gameContract_write: any;
  charContract_read: any;
  itemContract_read: any;
  playerSignerAddress: string;
  actionsContract_write: any; // TODO: Any
  actionsContract_read: any;
  playersContract_read: any;
  playersContract_write: any;
  utilsContract_read: any;
  setCurrentGameNumber: Function;
  walletLoaded: boolean;
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
  traits: TraitsInterface;
  cloneNumber: number;  // High but possibly reachable limit
  maxClones: number; // Eventually exit them from the economy??
  ability: number;
  flaw: number;
  inGame: boolean;
  dead: boolean;
  id: number;
}

export default function GameBoard(props: GameBoardProps) {
  const n = 11; // TODO: Hardcoded board size, can't use await here

  // const [loading, setLoading] = useState(false);
  const [numGames, setNumGames] = useState(0);
  const [currentGame, setCurrentGame] = useState<GameInterface>(EmptyGame);
  const [roomTiles, setRoomTiles] = useState<RoomTile[]>([]);
  const [gameTiles, setGameTiles] = useState(Array.from({ length: n }, () => Array.from({ length: n }, () => EmptyTile)));
  const [doors, setDoors] = useState<DoorInterface[]>([]);
  const [players, setPlayers] = useState<PlayerInterface[]>([]);
  const [chars, setChars] = useState<CharInterface[]>([]);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [formGameNumber, setFormGameNumber] = useState(props.currentGameNumber);
  const [currentPlayerItems, setCurrentPlayerItems] = useState<any[]>(); // TODO: Any

  const [lastDieRoll, setLastDieRoll] = useState("None");
  const [eventFlipper, setEventFlipper] = useState(true); // TODO: Confusing name, think this should be actionFlipper
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [eventResolved, setEventResolved] = useState(false);

  const [zoomed, setZoomed] = useState(true);

  const updateCurrentPlayerItemsFromChain = async () => {
    const playerIndexes = await props.gameContract_read.extGetGamePlayerIndexes(props.currentGameNumber);
    // console.log("Player indexes", playerIndexes);

    let playerItems: any[][] = [];
    for (let i = 0; i < playerIndexes.length; i++) {
      const currentPlayerId = playerIndexes[i];
      console.log("Getting items for player", currentPlayerId);
      // TODO: Debug this.  Works fine in unit test trying to get items from null set, crashes here
      const remoteItems = await props.itemContract_read.getItemsByPlayer(currentPlayerId);

      playerItems.push(remoteItems);
    }
    setCurrentPlayerItems(playerItems);
  }

  const updateBoardFromChain = async () => {
    timesBoardPulled++;
    console.log("timesBoardPulled", timesBoardPulled);
    const remoteBoard = await props.mapContract_read.extGetBoard(props.currentGameNumber); // TODO: Confirm that game and map numbers will always match
    const localBoard = Array.from({ length: n }, () => Array.from({ length: n }, () => EmptyTile));

    remoteBoard.forEach((rowData: GameTileInterface[], row: number) => {
      rowData.forEach((gameTile: GameTileInterface, col) => {
        localBoard[row][col] = gameTile;
      })
    })

    const remoteRoomTiles = await props.mapContract_read.extGetRoomList(props.currentGameNumber);// TODO: Confirm that game and map numbers will always match
    const localRoomTiles: RoomTile[] = [];

    remoteRoomTiles.forEach((roomTile: RoomTile) => {
      localRoomTiles.push(roomTile);
    });

    // TODO: Hack for broken reactor.  Remove next time you see this!
    localRoomTiles[100] = EmptyRoomTile;

    // console.log(localRoomTiles);
    setGameTiles(localBoard);
    setRoomTiles(localRoomTiles);
  }

  const updateCharsFromChain = async () => {
    const updatedChars: CharInterface[] = [];
    // TODO: Get the cached char id list instead of loading it
    const playerIndexes = await props.gameContract_read.extGetGamePlayerIndexes(props.currentGameNumber);

    for (let i = 0; i < playerIndexes.length; i++) {
      const remotePlayer = await props.playersContract_read.players(playerIndexes[i]);
      const remoteChar = await props.charContract_read.characters(remotePlayer.characterId);
      updatedChars.push(remoteChar);
    }

    setChars(updatedChars);
  }

  const updateDoorsFromChain = async () => {
    const remoteDoors = await props.mapContract_read.extGetDoors(props.currentGameNumber); // TODO: Get game first and get board number from it
    // console.log(remoteDoors);

    const newDoors: DoorInterface[] = [];

    remoteDoors.forEach((door: DoorInterface, index: number) => {
      const newDoor: DoorInterface = { vsBreach: door.vsBreach, vsHack: door.vsHack, status: door.status, rotate: false };
      // newDoors[index] = newDoor;
      newDoors.push(newDoor);
    });

    setDoors(newDoors);
  }

  const updateRemotePlayers = async () => {
    const newPlayers: PlayerInterface[] = [];

    const playerIndexes = await props.gameContract_read.extGetGamePlayerIndexes(props.currentGameNumber);

    for (let i = 0; i < playerIndexes.length; i++) {
      const remotePlayer = await props.playersContract_read.players(playerIndexes[i]);
      const { position } = remotePlayer;
      const newPlayer: PlayerInterface = {
        remoteId: playerIndexes[i],

        owner: remotePlayer.owner,
        charContractAddress: remotePlayer.charContractAddress,
        characterId: remotePlayer.characterId,

        position: position,

        healthDmgTaken: remotePlayer.healthDmgTaken,
        armorDmgTaken: remotePlayer.armorDmgTaken,
        actionsTaken: remotePlayer.actionsTaken,

        dataTokens: remotePlayer.dataTokens,
        currentEffects: remotePlayer.currentEffects,
        inventoryIDs: remotePlayer.inventoryIDs,

        canHarmOthers: remotePlayer.canHarmOthers,
        dead: remotePlayer.dead
      }
      newPlayers.push(newPlayer);
    }
    setPlayers(newPlayers);
  }

  const loadGameBoard = async () => {

    if (eventFlipper === true) {
      setNumGames(await props.gameContract_read.extGetNumGames());
      console.log("Loading game number from event:", props.currentGameNumber)
      const remoteGame = await props.gameContract_read.games(props.currentGameNumber);
      setCurrentGame(remoteGame);
      console.log("updating doors, board, players from chain")

      await updateDoorsFromChain();
      await updateBoardFromChain();
      await updateRemotePlayers();
      await updateCurrentPlayerItemsFromChain();

      await updateCharsFromChain();

      setEventFlipper(false);
    }

    if (gameLoaded === false) {
      setNumGames(await props.gameContract_read.extGetNumGames());
      console.log("Loading game number from start:", props.currentGameNumber)
      const remoteGame = await props.gameContract_read.games(props.currentGameNumber);
      setCurrentGame(remoteGame);
      await updateDoorsFromChain();
      await updateBoardFromChain();
      await updateRemotePlayers();
      await updateCurrentPlayerItemsFromChain();

      await updateCharsFromChain();
      setGameLoaded(true);
    }

    // Maybe need to have await tx.await() here?
    // setLoading(false);
  }

  useEffect(() => {
    console.log("Start of useEffect in Board");

    loadGameBoard();
    if (props.walletLoaded && !eventsLoaded) {
      // TODO: Find appropriate home
      // WARNING:  This is creating a stale closure, but it's not impacted because the listener is destroyed and recreated when the game changes
      // TODO: This is here because if it's in App, for some reason, events cause the tab content to unmount and remount, completely reloading Board
      props.actionsContract_read.on("ActionCompleteEvent", (gameId: any, game: any, playerId: any, player: any, action: any, event: any) => {
        console.log("Event Game ID", gameId)
        console.log("Event Game", game);
        console.log("Event Action", action);

        const { mapId } = game;
        console.log("MapID", mapId)
        // TODO: Hack using mapID instead of gameId
        console.log("Test is", mapId == props.currentGameNumber)
        // DO NOT USE ===, will always be false!!
        if (mapId == props.currentGameNumber) {
          setEventFlipper(true);
        }
      });

      props.utilsContract_read.on("DiceRollEvent", (gameId: any, roll: any, event: any) => {
        console.log("Roll Event roll", roll);
        // TODO: Hack using mapID instead of gameId
        // DO NOT USE ===, will always be false!!
        if (gameId == props.currentGameNumber) {
          setLastDieRoll(roll.toString());
        }
      });

      props.playersContract_read.on("EventResolvedEvent", (gameId: any, playerId: any, currentEvent: any, appliedEffects: any, event: any) => {
        // DO NOT USE ===, will always be false!!
        console.log("Triggered Event Resolved Event");
        if (gameId == props.currentGameNumber) {
          setEventResolved(true);
          setEventFlipper(true);
          console.log("currentEvent", currentEvent);
          console.log("appliedEffects", appliedEffects);
        }
      });
      setEventsLoaded(true);
    }

  }, [gameLoaded, props.currentGameNumber, eventFlipper, props.walletLoaded]);

  function onUpdateGameClick() {
    setGameLoaded(false);
    // setLoading(true);
    localStorage.setItem("lastGame", formGameNumber.toString())
    props.setCurrentGameNumber(formGameNumber);
  }

  function renderRowWithDoors(row: number) {
    const rowWithDoors: ReactNode[] = [];
    gameTiles[row].forEach((tile: GameTileInterface, col) => {
      if (col === 0 || col === n - 1) {
        return;
      }
      const itemKey = row + "," + col;
      rowWithDoors.push((
        <Grid item xs={1} key={itemKey}>
          <Tile
            tile={tile}
            players={players}
            chars={chars}
            row={row}
            col={col}
            currentGame={currentGame}
            roomTiles={roomTiles}
          />
        </Grid>
      ));
      // Don't render the last door.  -2 because other process skips outer ring
      if (col < n - 2) {
        rowWithDoors.push(
          <Door
            vsBreach={doors[tile.doors[2]].vsBreach}
            vsHack={doors[tile.doors[2]].vsHack}
            status={doors[tile.doors[2]].status}
            rotate={true}
            key={itemKey+"-door-id-"+tile.doors[2]}
          />);
      }
    })
    return rowWithDoors;
  }

  // Render N/S doors based on the south door of each tile
  function renderRowOfDoors(row: number) {
    const rowOfDoors: ReactNode[] = [];
    // Start with a small, empty item to offset doors for alignment
    rowOfDoors.push((
      <Grid item xs={.25} key={row+"-starter"}>
        <Card>

        </Card>
      </Grid>
    ));
    gameTiles[row].forEach((tile: GameTileInterface, col) => {
      if (col === 0 || col === n - 1) {
        return;
      }
      const itemKey = row + "," + col;
      rowOfDoors.push(
        <Door
          vsBreach={doors[tile.doors[1]].vsBreach}
          vsHack={doors[tile.doors[1]].vsHack}
          status={doors[tile.doors[1]].status}
          rotate={false}
          key={itemKey+"-door-id-"+tile.doors[1]}
        />);


      // Push an "empty" card to maintain grid, except the last
      if (col < n - 1) {
        rowOfDoors.push((
          <Grid item xs={1} key={row+','+col+'-empty'}>
            <Card>

            </Card>
          </Grid>
        ));
      }

    })

    return rowOfDoors;
  }

  function renderMapWithDoors() {
    const rows: ReactNode[] = [];
    gameTiles.forEach((rowData: GameTileInterface[], row) => {
      if (row === 0) {
        return;
      }
      if (row < n - 1) {
        rows.push(
          <Box key={row+"-withDoors"}>
            <Grid container spacing={0} columns={DISPLAY_COLUMNS}>
              {renderRowWithDoors(row)}
            </Grid>
            <Grid container spacing={0} columns={DISPLAY_COLUMNS}>
              {renderRowOfDoors(row)}
            </Grid>
          </Box>
        );
      } else { // Don't print a row of doors at the bottom
        rows.push(
          <Box key={row+"-withDoors"}>
            <Grid container spacing={0} columns={DISPLAY_COLUMNS}>
              {renderRowWithDoors(row)}
            </Grid>
          </Box>
        );
      }
    })
    return rows;
  }

  function renderMapArea() {
    // if (numGames === 0) {
    //   return (
    //     <Box>No games yet!</Box>
    //   )
    // }

    if (props.currentGameNumber > numGames) {
      return (
        <Box>Selected game does not exist!</Box>
      )
    }

    return (!gameLoaded ? "Loading..." :
      <Card>
        <CardContent>
          <Box sx={{ flexGrow: 1 }}>
            {renderMapWithDoors()}
          </Box>
        </CardContent>
      </Card>
    )
  }

  function getNumItems() {
    const currentPlayer = players[currentGame.currentPlayerTurnIndex];
    const currentRoomId = gameTiles[currentPlayer.position.row][currentPlayer.position.col].roomId;
    // console.log("there are this many items:", roomTiles[currentRoomId].numItems)
    // console.log(typeof(roomTiles[currentRoomId].numItems))

    return roomTiles[currentRoomId].numItems;
  }

  function handleGameSelectorChange(event: SelectChangeEvent) {
    const gameNum = event.target.value;
    setGameLoaded(false);
    localStorage.setItem("lastGame", gameNum.toString())
    props.setCurrentGameNumber(gameNum);
  }

  function buildGamesDropDown() {
    const menuItems: ReactNode[] = [];
    for (let i = 0; i < numGames; i++) {
      menuItems.push(
        <MenuItem key={"games-dd-" + i} value={i}>{i}</MenuItem>
      );
    }
    return menuItems;
  }

  function renderGameArea() {
    return (!gameLoaded ? "Loading Game Area..." :
      <Grid container spacing={0} columns={DISPLAY_COLUMNS}>
        <Grid item xs={3}>
          <Card>
            <GamePanel
              currentPlayer={players[currentGame.currentPlayerTurnIndex]}
              currentChar={chars[currentGame.currentPlayerTurnIndex]}
              currentGameProps={currentGame}
              currentGameNumber={props.currentGameNumber}
              playerSignerAddress={props.playerSignerAddress}
              actionsContract_write={props.actionsContract_write}
              gameContract_write={props.gameContract_write}
              lastDieRoll={lastDieRoll}
              setLastDieRoll={setLastDieRoll}
              numItems={getNumItems()}
              allHeldItems={currentPlayerItems}
              roomTiles={roomTiles}
              players={players}
              chars={chars}
              currentTile={gameTiles[players[currentGame.currentPlayerTurnIndex].position.row][players[currentGame.currentPlayerTurnIndex].position.col]}
              setEventFlipper={setEventFlipper}
              eventResolved={eventResolved}
              setEventResolved={setEventResolved}
            />
          </Card>
          <Box>
            <FormControl fullWidth>
              <InputLabel id="game-selector-label">Change Game</InputLabel>
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
        <Grid item xs={9}>
          {renderMapArea()}
        </Grid>
      </Grid>
    )
  }

  return (!gameLoaded ? <Box>"Loading Board..."</Box> :
    <Box>
      {renderGameArea()}
    </Box>
  );
}
