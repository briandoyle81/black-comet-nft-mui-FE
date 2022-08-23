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

import TileBack from "./assets/img/tile_back.png"
import { roomDisplayDataList } from './components/RoomTiles';

// TODO: Figure out where to keep
const ROOM_TILES_CONTRACT_ADDRESS = "0xe51B0ab24F6dec7cEe150D65ce61C9d05E5657CB";
const GAME_CONTRACT_ADDRESS = "0x98b081cB4828ecc00500b3688450f8c3759DC613";

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

function App() {
  // const tempLink = require("./assets/img/Auxiliary Reactor[face].png")
  const n = 9; // TODO: Hardcoded board size, can't use await here

  const [loading, setLoading] = useState(false)
  const [artLink, setArtLink] = useState(TileBack);
  const [gameBoard, setGameBoard] =  useState(Array.from({length: n},()=> Array.from({length: n}, () => 0)));

  const updateBoard = (row: number, column: number, id: number) => {
    let copy = [...gameBoard];
    copy[row][column] = id;
    setGameBoard(copy);

    // console.log(gameBoard);
  };

  useEffect(() => {
    const loadGameBoard = async () => {
      setLoading(true);
      const roomTile = await roomTilesContract_read.roomTiles(2);
      console.log(roomTile);

      const boardSize = await gameContract_read.BOARD_SIZE();
      console.log(boardSize);


      const board = await gameContract_read.extGetBoard(0); // TODO: hardcoded game number
      console.log(board);

      const localBoard = Array.from({ length: n }, () => Array.from({ length: n }, () => 0));

      for (let row = 0; row < n; row++) {
        for (let col = 0; col < n; col++) {
          const { roomId, nDoor, sDoor, eDoor, wDoor } = board[row][col];
          localBoard[row][col] = roomId;
        }
      }

      setGameBoard(localBoard);
      console.log("loaded board", gameBoard);

      setLoading(false);
    }

    // Call the function
    loadGameBoard();
  }, []);

  function renderRow(row: number) {
    const renderedRow = gameBoard[row].map((val) => {
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


  // function renderBoard() {
  //   gameBoard.forEach( (row) => )
  // }


  return (
    <div className="App">
      <Paper>
        <Card>
          <Box sx={{ flexGrow: 1 }}>
            {renderMap()}
          </Box>
        </Card>
      </Paper>
    </div>
  );
}

export default App;
