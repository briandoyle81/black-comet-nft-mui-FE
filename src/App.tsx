import { Card, CardMedia } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';
import './App.css';
import GamePanel, { GameInterface } from './components/GamePanel';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import { ethers, utils } from 'ethers';

// import { Image } from 'mui-image';

// TODO: Figure out how to manage this automatically
import eventsDeployData from "./deployments/BCEvents.json";
import roomTilesContractDeployData from "./deployments/RoomTiles.json";
import charContractDeployData from "./deployments/BCChars.json";
import itemsContractDeployData from "./deployments/BCItems.json";
import gameContractDeployData from "./deployments/BCGames.json";
import utilsContractDeployData from "./deployments/BCGames.json";
import mapsContractDeployData from "./deployments/Maps.json";
import lobbiesContractDeployData from "./deployments/Lobby.json";

import { roomDisplayDataList } from './components/RoomTiles';

import { DoorInterface, DoorStatus } from './components/Doors';

import Door from "./components/Doors";

import Vent from "./assets/img/overlays/vent.png";
import Player, { PlayerInterface } from './components/Player';
import { Position } from './components/Utils';
import GameInfo from './components/GameInfo';

// TODO: Internet suggested hack to stop window.ethereum from being broken
declare var window: any;

const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/RQa3QfZULvNhxYAurC0GyfvIdvi-elje");
// const debugSigner = new ethers.Wallet(process.env.REACT_APP_METAMASK_WALLET_1 as string, provider);
let playerSigner: any; //TODO: any
let gameContract_write: any; // TODO: any
let playerAddress: string;

const roomTilesContract_read = new ethers.Contract(roomTilesContractDeployData.address, roomTilesContractDeployData.abi, provider);
const gameContract_read = new ethers.Contract(gameContractDeployData.address, gameContractDeployData.abi, provider);
const lobbiesContract_read = new ethers.Contract(lobbiesContractDeployData.address, lobbiesContractDeployData.abi, provider);
const mapContract_read = new ethers.Contract(mapsContractDeployData.address, mapsContractDeployData.abi, provider);
// myContract_write = new ethers.Contract(address, abi, signer)    // Write only

// const gameEventFilter = {
//   address: gameContractDeployData.address,
//   topics: [
//     utils.id("DiceRollEvent(uint,uint)"),
//     utils.id("ActionCompleteEvent(BCTypes.Player,BCTypes.Action)")
//   ]
// }

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

// TODO: Move interfaces to util file?
interface GameTileInterface {
  roomId: number,
  parentId: number,

  doors: number[],

  explored: boolean,
  looted: boolean,
  hasVent: boolean
}

const EmptyTile: GameTileInterface = {
  roomId: 0,
  parentId: 0,

  doors: [],

  explored: false,
  looted: false,
  hasVent: false
}

const EmptyGame: GameInterface = {
  active: false,

  playerIndexes: [0, 0, 0, 0],
  currentPlayerTurnIndex: 0,
  numPlayers: 0,

  turnsTaken: 0,

  mapContract: "",
  mapId: 0
}

const EmptyDoor: DoorInterface = {
  vsBreach: 0,
  vsHack: 0,
  status: DoorStatus.NO_DOOR,
  rotate: false
}

// TODO: Why does it need negative, and why does it change size/scale
const VentOverlay = styled(Card)(({ theme }) => ({
  position: 'absolute',
  left: '-55%',
  bottom: '-55%',
  scale: '15%'
}));

function App() {
  const n = 9; // TODO: Hardcoded board size, can't use await here


  const [loading, setLoading] = useState(true);
  const [walletLoaded, setWalletLoaded] = useState(false);
  const [currentGame, setCurrentGame] = useState(EmptyGame);
  const [currentGameNumber, setCurrentGameNumber] = useState(0);
  const [gameTiles, setGameTiles] = useState(Array.from({ length: n }, () => Array.from({ length: n }, () => EmptyTile)));
  const [doors, setDoors] = useState<DoorInterface[]>([]);
  const [players, setPlayers] = useState<PlayerInterface[]>([]);


  // setLoading(false);

  async function updateBoardFromChain() {
      const remoteBoard = await mapContract_read.extGetBoard(currentGameNumber);
      const localBoard = Array.from({ length: n }, () => Array.from({ length: n }, () => EmptyTile));

      remoteBoard.forEach((rowData: GameTileInterface[], row: number) => {
        rowData.forEach((gameTile: GameTileInterface, col) => {
          localBoard[row][col] = gameTile;
        })
      })

      setGameTiles(localBoard);
    }

  async function updateDoorsFromChain() {
    const remoteDoors = await mapContract_read.extGetDoors(currentGameNumber); // TODO: Get game first and get board number from it
      // console.log(remoteDoors);

    const newDoors: DoorInterface[] = [];

    remoteDoors.forEach((door: DoorInterface, index: number) => {
      const newDoor: DoorInterface = { vsBreach: door.vsBreach, vsHack: door.vsHack, status: door.status, rotate: false };
      // newDoors[index] = newDoor;
      newDoors.push(newDoor);
    });

    setDoors(newDoors);
  }

  async function updateRemotePlayers(gameId: number) {
    const newPlayers: PlayerInterface[] = [];

    const playerIndexes = await gameContract_read.extGetGamePlayerIndexes(gameId);

    for (let i = 0; i < playerIndexes.length; i++) {
      const remotePlayer = await gameContract_read.players(playerIndexes[i]);
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

  useEffect(() => {
    console.log("Start of useEffect");

    const loadWallet = async () => {
      // TODO: Cleanup
      console.log("Loading wallet");
      const provider2 = new ethers.providers.Web3Provider(window.ethereum, "any");
      // Prompt user for account connections
      await provider2.send("eth_requestAccounts", []);
      playerSigner = provider2.getSigner();
      playerAddress = await playerSigner.getAddress();

      gameContract_write = new ethers.Contract(gameContractDeployData.address, gameContractDeployData.abi, playerSigner);
      setWalletLoaded(true);

      // TODO: Find appropriate home
      gameContract_read.on("ActionCompleteEvent", (player, action, event) => {
        console.log("Event Player", player);
        console.log("Event Action", action);
        // console.log("Event", event);
        updateDoorsFromChain();

        updateBoardFromChain();
        console.log("CurrentGameNumber", currentGameNumber);
        updateRemotePlayers(currentGameNumber);
      })

      gameContract_read.on("DiceRollEvent", (roll, against, event) => {
        console.log("Roll Event Setter", roll);
        console.log("Roll Event Data", against);
        console.log("Roll Event", event);
      })
    }

    const loadGameBoard = async () => {
      setLoading(true);
      // const boardSize = await gameContract_read.BOARD_SIZE();
      // console.log(boardSize);

      const remoteGame = await gameContract_read.games(currentGameNumber);
      setCurrentGame(remoteGame);
      // console.log(currentGame);

      await updateDoorsFromChain();

      await updateBoardFromChain();

      await updateRemotePlayers(currentGameNumber);

      // Maybe need to have await tx.await() here?
      setLoading(false);

    }




    // Call the function
    if (!walletLoaded) {
      loadWallet();
    }

    loadGameBoard();

  }, [currentGameNumber]);


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
      return (<></>)
    }
  }

  // TODO: Rewrite to put players in a row
  function renderPlayers(position: Position) {
    const playerRenders: ReactNode[] = [];
    // console.log(players.length || "no players")
    // TODO: Why isn't the loading mechanism catching no players?
    if (players.length > 0) {
      players.forEach((player: PlayerInterface) => { // TODO: any
        // console.log(position, player.position)
        if (position.row === player.position.row && position.col === player.position.col) {
          playerRenders.push(
            <>
              <Player {...{ player: player, portrait: false }} />
            </>)
            ;
        }
      });
    }

    return playerRenders;
  }

  function renderRowWithDoors(row: number) {
    const rowWithDoors: ReactNode[] = [];
    gameTiles[row].forEach((tile: GameTileInterface, col) => {
      rowWithDoors.push((
        <Grid item xs={1}>
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
        rowWithDoors.push(<Door vsBreach={doors[tile.doors[2]].vsBreach} vsHack={doors[tile.doors[2]].vsHack} status={doors[tile.doors[2]].status} rotate={true} />);
      }
    })
    return rowWithDoors;
  }

  // Render N/S doors based on the south door of each tile
  function renderRowOfDoors(row: number) {
    const rowOfDoors: ReactNode[] = [];
    // Start with a small, empty item to offset doors for alignment
    rowOfDoors.push((
      <Grid item xs={.25}>
        <Card>

        </Card>
      </Grid>
    ));
    gameTiles[row].forEach((tile: GameTileInterface, col) => {
      rowOfDoors.push(<Door vsBreach={doors[tile.doors[1]].vsBreach} vsHack={doors[tile.doors[1]].vsHack} status={doors[tile.doors[1]].status} rotate={false} />);


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
          <>
            <Grid container spacing={0} columns={(n * 2) - 1}>
              {renderRowWithDoors(row)}
            </Grid>
            <Grid container spacing={0} columns={(n * 2) - 1}>
              {renderRowOfDoors(row)}
            </Grid>
          </>
        );
      } else { // Don't print a row of doors at the bottom
        rows.push(
          <>
            <Grid container spacing={0} columns={(n * 2) - 1}>
              {renderRowWithDoors(row)}
            </Grid>
          </>
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
    if (playerAddress === undefined) {
      return "Waiting for game"
    }
    return (loading ? "Loading..." :
      <Grid container spacing={0} columns={12}>
        <Grid item xs={9}>
          {renderMapArea()}
        </Grid>
        <Grid item xs={3}>
          <Card>
            <GamePanel
              currentPlayer={players[currentGame.currentPlayerTurnIndex]}
              currentGameProps={currentGame}
              currentGameNumber={currentGameNumber}
              playerSignerAddress={playerAddress}
              gameContract_write={gameContract_write}
              updateBoardFromChain={updateBoardFromChain}
              updateDoorsFromChain={updateDoorsFromChain}
              updateRemotePlayers={updateRemotePlayers}
            />
          </Card>
        </Grid>
      </Grid>
    )
  }

  return ( loading ? <div>"Loading..."</div> :
    <div className="App">
      {renderGameArea()}
    </div>
  );
}

export default App;
