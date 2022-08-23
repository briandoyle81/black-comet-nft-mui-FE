import { Card, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import './App.css';
import GamePanel from './components/GamePanel';

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


function App() {
  // const tempLink = require("./assets/img/Auxiliary Reactor[face].png")

  const [loading, setLoading] = useState(false)
  const [artLink, setArtLink] = useState(TileBack);

  useEffect(() => {


    const loadGameBoard = async () => {
      setLoading(true);
      const roomTile = await roomTilesContract_read.roomTiles(2);
      console.log(roomTile);

      const boardSize = await gameContract_read.BOARD_SIZE(); // TODO: Figure out why automatic getters don't work
      console.log(boardSize);


      const board = await gameContract_read.extGetBoard(0); // TODO: hardcoded game number
      console.log(board);

      setLoading(false);
    }

    // Call the function
    loadGameBoard();
    }, []);


  return (
    <div className="App">
      <Paper>
        <Card>
          <GamePanel />
          <div>
            {loading ? (<h4>Loading...</h4>) : (<img src={artLink} alt="whatever"/>)}
          </div>
        </Card>
      </Paper>
    </div>
  );
}

export default App;
