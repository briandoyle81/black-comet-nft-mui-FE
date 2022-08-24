import { Card, CardMedia } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';
import './App.css';
import GamePanel from './components/GamePanel';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import { ethers } from 'ethers';

// import { Image } from 'mui-image';

// TODO: Figure out how to manage this
import roomTilesContractDeployData from "./RoomTiles.json";
import gameContractDeployData from "./BCGames.json";

import { roomDisplayDataList } from './components/RoomTiles';

import { DoorInterface, DoorStatus } from './components/Doors';

import Door from "./components/Doors";

// TODO: Figure out where to keep
const ROOM_TILES_CONTRACT_ADDRESS = roomTilesContractDeployData.address;
// const GAME_CONTRACT_ADDRESS = "0x7AA55498C31a4a399f525D1e8BD9e68531535966";
const GAME_CONTRACT_ADDRESS = gameContractDeployData.address;

const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/RQa3QfZULvNhxYAurC0GyfvIdvi-elje");
// const debugSigner = new ethers.Wallet(process.env.REACT_APP_METAMASK_WALLET_1 as string, provider);

const roomTilesContract_read = new ethers.Contract(ROOM_TILES_CONTRACT_ADDRESS, roomTilesContractDeployData.abi, provider);
const gameContract_read = new ethers.Contract(GAME_CONTRACT_ADDRESS, gameContractDeployData.abi, provider);

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

  nDoor: number,
  sDoor: number,
  eDoor: number,
  wDoor: number,

  explored: boolean,
  looted: boolean,
  hasVent: boolean
}

const EmptyTile: GameTileInterface = {
  roomId: 0,
  parentId: 0,

  nDoor: 0,
  sDoor: 0,
  eDoor: 0,
  wDoor: 0,

  explored: false,
  looted: false,
  hasVent: false
}

const DEBUG_GAME_NUMBER = 0;  // TODO hardcoded game number

function App() {
  // const tempLink = require("./assets/img/Auxiliary Reactor[face].png")
  const n = 9; // TODO: Hardcoded board size, can't use await here

  const [loading, setLoading] = useState(false);
  const [gameTiles, setGameTiles] = useState(Array.from({ length: n }, () => Array.from({ length: n }, () => EmptyTile)));
  const [doors, setDoors] = useState<DoorInterface[]>([]);


  function updateBoardFromChain(remoteBoard: any[]) {
    const localBoard = Array.from({ length: n }, () => Array.from({ length: n }, () => EmptyTile));

    remoteBoard.forEach((rowData: GameTileInterface[], row) => {
      rowData.forEach((gameTile: GameTileInterface, col) => {
        localBoard[row][col] = gameTile;
      })
    })

    setGameTiles(localBoard);
  }

  useEffect(() => {
    const loadGameBoard = async () => {
      const gameNumber = DEBUG_GAME_NUMBER;
      setLoading(true);

      // const boardSize = await gameContract_read.BOARD_SIZE();
      // console.log(boardSize);

      const remoteDoors = await gameContract_read.extGetDoors(gameNumber);
      let newDoors: Array<DoorInterface> = [];

      remoteDoors.forEach((door: DoorInterface) => {
        newDoors.push({vsBreach: door.vsBreach, vsHack: door.vsHack, status: door.status, rotate: false});
      });

      setDoors(newDoors); // TODO: WHy does hitting refresh break this?

      // console.log("newDoors", newDoors);
      // console.log("Locally, doors are", doors);


      const remoteBoard = await gameContract_read.extGetBoard(gameNumber);
      // console.log(board);
      updateBoardFromChain(remoteBoard);

      setLoading(false);
    }

    // Call the function
    loadGameBoard();
  }, []);

  // function renderRow(row: number) {
  //   const renderedRow = gameTiles[row].map((tile, col) => {
  //     return (
  //       <Grid item xs={1}>
  //         <Card>
  //           <CardMedia
  //             image={roomDisplayDataList[tile.roomId].art}
  //             component="img"
  //           />
  //         </Card>
  //       </Grid>
  //     )
  //   })
  //   return renderedRow;
  // }
// <Door vsBreach={doors[tile.eDoor].vsBreach} vsHack={doors[tile.eDoor].vsHack} status={doors[tile.eDoor].status} />
  function renderRowWithDoors(row: number) {
    const rowWithDoors: ReactNode[] = [];
    gameTiles[row].forEach((tile: GameTileInterface, col) => {
      rowWithDoors.push((
        <Grid item xs={1}>
          <Card>
            <CardMedia
              image={roomDisplayDataList[tile.roomId].art}
              component="img"
            />
          </Card>
        </Grid>
      ));

      rowWithDoors.push(<Door vsBreach={doors[tile.eDoor].vsBreach} vsHack={doors[tile.eDoor].vsHack} status={doors[tile.eDoor].status} rotate={true} />);
    })
    return rowWithDoors;
  }

  // Render N/S doors based on the south door of each tile
  function renderRowOfDoors(row: number) {
    const rowOfDoors: ReactNode[] = [];
    gameTiles[row].forEach((tile: GameTileInterface, col) => {
      rowOfDoors.push(<Door vsBreach={doors[tile.sDoor].vsBreach} vsHack={doors[tile.sDoor].vsHack} status={doors[tile.sDoor].status } rotate={false} />);


      // Push an "empty" door for the grid
      rowOfDoors.push((
        <Door vsBreach={0} vsHack={0} status={DoorStatus.PLACEHOLDER} rotate={false} />
      ));
    })

    return rowOfDoors;
  }

  function renderMapWithDoors() {
    const rows: ReactNode[] = [];
    gameTiles.forEach((rowData: GameTileInterface[], row) => {
      rows.push(
        <Grid container spacing={0}>
          {renderRowWithDoors(row)}
          {renderRowOfDoors(row)}
        </Grid>
      );
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


  // function renderBoard() {
  //   gameBoard.forEach( (row) => )
  // }


  return (
    <div className="App">
      {renderMapArea()}
    </div>
  );
}

export default App;