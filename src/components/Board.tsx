import { Button, Card, CardMedia, TextField } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';
import GamePanel, { GameInterface } from './GamePanel';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import { ethers, utils } from 'ethers';

import { roomDisplayDataList } from './RoomTiles';

import { DoorInterface, DoorStatus } from './Doors';

import Door from "./Doors";

import Vent from "../assets/img/overlays/vent.png";
import Player, { PlayerInterface } from './Player';
import { Position } from './Utils';
import GameInfo from './GameInfo';

let timesBoardPulled = 0;

const DISPLAY_COLUMNS = 13;

const PlayersBox = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: '0',
  top: '0',
  zIndex: 2000,
  background: 'transparent',
}));
// TODO: Move interfaces to util file?
export interface GameTileInterface {
  roomId: number,
  parentId: number,

  doors: number[],

  explored: boolean,
  looted: boolean,
  hasVent: boolean
}

export const EmptyTile: GameTileInterface = {
  roomId: 0,
  parentId: 0,

  doors: [],

  explored: false,
  looted: false,
  hasVent: false
}

export const EmptyGame: GameInterface = {
  active: false,

  playerIndexes: [0, 0, 0, 0],
  currentPlayerTurnIndex: 0,
  numPlayers: 0,

  turnsTaken: 0,

  mapContract: "",
  mapId: 0,

  gameNumber: -1
}

export interface GameBoardProps {
  currentGameNumber: number;
  mapContract_read: any;  // TODO anys
  gameContract_read: any;
  charContract_read: any;
  playerSignerAddress: string;
  gameContract_write: any; // TODO: Any
  eventFlipper: boolean;
  resetEventFlipper: Function;
  lastDieRoll: number
  setCurrentGameNumber: Function;
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
}

// TODO: Why does it need negative, and why does it change size/scale
// TODO: Move to component?  Maybe move tiles to component
const VentOverlay = styled(Card)(({ theme }) => ({
  position: 'absolute',
  left: '-55%',
  bottom: '-55%',
  scale: '15%'
}));

export default function GameBoard(props: GameBoardProps) {
  const n = 9; // TODO: Hardcoded board size, can't use await here

  const [loading, setLoading] = useState(true);
  const [currentGame, setCurrentGame] = useState(EmptyGame);
  const [gameTiles, setGameTiles] = useState(Array.from({ length: n }, () => Array.from({ length: n }, () => EmptyTile)));
  const [doors, setDoors] = useState<DoorInterface[]>([]);
  const [players, setPlayers] = useState<PlayerInterface[]>([]);
  const [chars, setChars] = useState<CharInterface[]>([]);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [formGameNumber, setFormGameNumber] = useState(props.currentGameNumber);

  useEffect(() => {
    console.log("Start of useEffect in Board");
    async function updateCharsFromChain() {
      const updatedChars: CharInterface[] = [];
      // TODO: Get the cached char id list instead of loading it
      const playerIndexes = await props.gameContract_read.extGetGamePlayerIndexes(props.currentGameNumber);

      for (let i = 0; i < playerIndexes.length; i++) {
        const remotePlayer = await props.gameContract_read.players(playerIndexes[i]);
        const remoteChar = await props.charContract_read.characters(remotePlayer.characterId);
        updatedChars.push(remoteChar);
      }

      setChars(updatedChars);
    }

    async function updateBoardFromChain() {
      timesBoardPulled++;
      console.log("timesBoardPulled", timesBoardPulled);
      const remoteBoard = await props.mapContract_read.extGetBoard(props.currentGameNumber);
      const localBoard = Array.from({ length: n }, () => Array.from({ length: n }, () => EmptyTile));

      remoteBoard.forEach((rowData: GameTileInterface[], row: number) => {
        rowData.forEach((gameTile: GameTileInterface, col) => {
          localBoard[row][col] = gameTile;
        })
      })

      setGameTiles(localBoard);
    }

    async function updateDoorsFromChain() {
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

    async function updateRemotePlayers() {
      const newPlayers: PlayerInterface[] = [];

      const playerIndexes = await props.gameContract_read.extGetGamePlayerIndexes(props.currentGameNumber);

      for (let i = 0; i < playerIndexes.length; i++) {
        const remotePlayer = await props.gameContract_read.players(playerIndexes[i]);
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

      if (props.eventFlipper === true || gameLoaded === false) {
        await updateDoorsFromChain();
        await updateBoardFromChain();
        await updateRemotePlayers();

        if (props.eventFlipper) {
          props.resetEventFlipper();
        }
      }

      if (gameLoaded === false) {
        const remoteGame = await props.gameContract_read.games(props.currentGameNumber);
        setCurrentGame(remoteGame);
        await updateCharsFromChain();
        setGameLoaded(true);
      }


      // Maybe need to have await tx.await() here?
      setLoading(false);

    }
    loadGameBoard();

  }, [gameLoaded, props]);

  function onUpdateGameClick() {
    setGameLoaded(false);
    setLoading(true);
    props.setCurrentGameNumber(formGameNumber);
  }

  function renderVent(vent: boolean) {
    if (vent) {
      return (
        <VentOverlay>
          <CardMedia
            image={Vent}
            component="img"
          />
        </VentOverlay>
      )
    } else {
      return (<Box></Box>)
    }
  }

  function renderPlayers(position: Position) {
    const playerRenders: ReactNode[] = [];
    // console.log(players.length || "no players")
    // TODO: Why isn't the loading mechanism catching no players?
    if (players.length > 0) {
      players.forEach((player: PlayerInterface, index) => { // TODO: any
        // console.log(position, player.position)
        if (position.row === player.position.row && position.col === player.position.col) {
          playerRenders.push(
            <Grid item xs={3} key={index+"player"}>
              <Player {...{ player: player, portrait: false }} />
            </Grid>
          )
            ;
        }
      });
    }

    return (
      <PlayersBox>
        <Grid container>
          {playerRenders}
        </Grid>
      </PlayersBox>
    );
  }

  function renderRowWithDoors(row: number) {
    const rowWithDoors: ReactNode[] = [];
    gameTiles[row].forEach((tile: GameTileInterface, col) => {
      const itemKey = row + "," + col;
      rowWithDoors.push((
        <Grid item xs={1} key={itemKey}>
          <Card sx={{ position: 'relative' }}>
            <CardMedia
              image={roomDisplayDataList[tile.roomId].art}
              component="img"
            />
            {/* {tile.roomId} */}
            {renderVent(tile.hasVent)}
            {renderPlayers({ row: row, col: col })}
          </Card>
        </Grid>
      ));

      if (col < n - 1) {
        rowWithDoors.push(
          <Door
            vsBreach={doors[tile.doors[2]].vsBreach}
            vsHack={doors[tile.doors[2]].vsHack}
            status={doors[tile.doors[2]].status}
            rotate={true}
            key={itemKey+"door"}
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
      <Grid item xs={.25} key={row+"starter"}>
        <Card>

        </Card>
      </Grid>
    ));
    gameTiles[row].forEach((tile: GameTileInterface, col) => {
      const itemKey = row + "," + col;
      rowOfDoors.push(
        <Door
          vsBreach={doors[tile.doors[1]].vsBreach}
          vsHack={doors[tile.doors[1]].vsHack}
          status={doors[tile.doors[1]].status}
          rotate={false}
          key={itemKey+"door"}
        />);


      // Push an "empty" card to maintain grid, except the last
      if (col < n - 1) {
        rowOfDoors.push((
          <Grid item xs={1}>
            <Card>

            </Card>
          </Grid>
        ));
      }

    })

    return rowOfDoors;
  }

  function renderMapWithDoors() {
    // TODO: WHY DOESN"T THE "loading" STATE DO THIS????
    if (doors.length === 0) {
      return "Waiting for doors";
    }
    if (players.length === 0) {
      return "Waiting for players";
    }
    if (gameTiles.length === 0) {
      return "Waiting for gameTiles"
    }
    if (currentGame.mapContract === "") {
      return "Waiting for game"
    }
    const rows: ReactNode[] = [];
    gameTiles.forEach((rowData: GameTileInterface[], row) => {
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
    return (loading ? "Loading..." :
      <Paper>
        <Card>
          <Box sx={{ flexGrow: 1 }}>
            {renderMapWithDoors()}
          </Box>
        </Card>

      </Paper>
    )
  }

  function renderGameArea() {
    // TODO: WHY DOESN"T THE "loading" STATE DO THIS????
    if (doors.length === 0) {
      return "Waiting for doors";
    }
    if (players.length === 0) {
      return "Waiting for players";
    }
    if (gameTiles.length === 0) {
      return "Waiting for gameTiles"
    }
    if (currentGame.mapContract === "") {
      return "Waiting for game"
    }
    if (props.playerSignerAddress === undefined) {
      return "Waiting for game"
    }
    // if (chars.length === 0) {
    //   return "Waiting for chars";
    // }
    return (loading ? "Loading Game Area..." :
      <Grid container spacing={0} columns={DISPLAY_COLUMNS}>
        <Grid item xs={9}>
          {renderMapArea()}
        </Grid>
        <Grid item xs={3}>
          <Card>
            <Box
              component="form"
              sx={{
                '& > :not(style)': { m: 1, width: '25ch' },
              }}
              noValidate
              autoComplete="off"
            >
              <TextField
                id="game-number"
                label="Game Number"
                variant="outlined"
                value={formGameNumber}
                onChange={(event) => {setFormGameNumber(Number(event.target.value))}}
              />
              <Button variant="contained" onClick={onUpdateGameClick}>Submit</Button>
            </Box>
            <GamePanel
              currentPlayer={players[currentGame.currentPlayerTurnIndex]}
              currentChar={chars[currentGame.currentPlayerTurnIndex]}
              currentGameProps={currentGame}
              currentGameNumber={props.currentGameNumber}
              playerSignerAddress={props.playerSignerAddress}
              gameContract_write={props.gameContract_write}
              lastDieRoll={props.lastDieRoll}
            />
          </Card>
        </Grid>
      </Grid>
    )
  }

  return (loading ? <Box>"Loading Board..."</Box> :
    <Box>
      {renderGameArea()}
    </Box>
  );
}
