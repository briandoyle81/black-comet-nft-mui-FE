import { Card, CardMedia } from '@mui/material';
import React, { useEffect, useState } from 'react';
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

const DEBUG_GAME_NUMBER = 0;  // TODO hardcoded game number

function App() {
  // const tempLink = require("./assets/img/Auxiliary Reactor[face].png")
  const n = 9; // TODO: Hardcoded board size, can't use await here

  const [loading, setLoading] = useState(false)
  const [gameBoard, setGameBoard] = useState(Array.from({ length: n }, () => Array.from({ length: n }, () => 0)));
  const [doors, setDoors] = useState<DoorInterface[]>([]);

  const updateBoard = (row: number, column: number, id: number) => {
    let copy = [...gameBoard];
    copy[row][column] = id;
    setGameBoard(copy);
  };

  useEffect(() => {
    const loadGameBoard = async () => {
      const gameNumber = DEBUG_GAME_NUMBER;
      setLoading(true);

      // const boardSize = await gameContract_read.BOARD_SIZE();
      // console.log(boardSize);

      const remoteDoors = await gameContract_read.extGetDoors(gameNumber);
      let newDoors: Array<DoorInterface> = [];

      remoteDoors.forEach((door: DoorInterface) => {
        newDoors.push({vsBreach: door.vsBreach, vsHack: door.vsHack, status: door.status});
      });

      setDoors(newDoors); // TODO: WHy does hitting refresh break this?

      // console.log("newDoors", newDoors);
      // console.log("Locally, doors are", doors);


      const board = await gameContract_read.extGetBoard(gameNumber);
      // console.log(board);

      const localBoard = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));

      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
          const { roomId, nDoor, sDoor, eDoor, wDoor } = board[row][col];
          localBoard[row][col] = roomId;
        }
      }
      setGameBoard(localBoard);

      setLoading(false);
    }

    // Call the function
    loadGameBoard();
  }, []);

  function renderRow(row: number) {
    const renderedRow = gameBoard[row].map((val, col) => {
      return (
        <Grid item xs={1}>
          <Card>
            <CardMedia
              image={roomDisplayDataList[val].art}
              component="img"
            />
          </Card>
        </Grid>
      )
    })
    return renderedRow;
  }

  function renderMap() {
    const rows = gameBoard.map((rowData, rowIndex) => {
      return (
        <Grid container spacing={1}>
          {renderRow(rowIndex)}
        </Grid>
      )
    })
    return rows;
  }

  function renderMapArea() {
    return (loading ? "Loading..." :
      <Paper>
        <Card>
          <Box sx={{ flexGrow: 1 }}>
            {renderMap()}
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
      <Door vsBreach={0} vsHack={0} status={DoorStatus.BREACHED} />
    </div>
  );
}

export default App;
