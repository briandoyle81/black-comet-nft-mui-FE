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
// import utilsContractDeployData from "./deployments/BCGames.json";
import mapsContractDeployData from "./deployments/Maps.json";
import lobbiesContractDeployData from "./deployments/Lobby.json";

import { roomDisplayDataList } from './components/RoomTiles';

import { DoorInterface, DoorStatus } from './components/Doors';

import Door from "./components/Doors";

import Vent from "./assets/img/overlays/vent.png";
import Player, { PlayerInterface } from './components/Player';
import { Position } from './components/Utils';
import GameInfo from './components/GameInfo';
import GameBoard from './components/Board';
import { render } from '@testing-library/react';
import Characters from './components/Characters';

// TODO: Internet suggested hack to stop window.ethereum from being broken
declare var window: any;

const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/zp-Tq0B2ca_enpFDdUqiGjJnPD11sxQP");
// const debugSigner = new ethers.Wallet(process.env.REACT_APP_METAMASK_WALLET_1 as string, provider);
let playerSigner: any; //TODO: any
let gameContract_write: any; // TODO: any
let charContract_write: any;
let playerAddress: string;

// const roomTilesContract_read = new ethers.Contract(roomTilesContractDeployData.address, roomTilesContractDeployData.abi, provider);
const gameContract_read = new ethers.Contract(gameContractDeployData.address, gameContractDeployData.abi, provider);
const lobbiesContract_read = new ethers.Contract(lobbiesContractDeployData.address, lobbiesContractDeployData.abi, provider);
const charContract_read = new ethers.Contract(charContractDeployData.address, charContractDeployData.abi, provider);
const mapContract_read = new ethers.Contract(mapsContractDeployData.address, mapsContractDeployData.abi, provider);
// myContract_write = new ethers.Contract(address, abi, signer)    // Write only

// const gameEventFilter = {
//   address: gameContractDeployData.address,
//   topics: [
//     utils.id("DiceRollEvent(uint,uint)"),
//     utils.id("ActionCompleteEvent(BCTypes.Player,BCTypes.Action)")
//   ]
// }

enum AppState { GAMES = 0, LOBBIES, CHARS}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

// const EmptyDoor: DoorInterface = {
//   vsBreach: 0,
//   vsHack: 0,
//   status: DoorStatus.NO_DOOR,
//   rotate: false
// }

function App() {
  const [appState, setAppState] = useState(AppState.CHARS);
  const [appLoading, setAppLoading] = useState(true);
  const [walletLoaded, setWalletLoaded] = useState(false);

  const [currentGameNumber, setCurrentGameNumber] = useState(0);

  const [eventFlipper, setEventFlipper] = useState(true);
  const [lastDieRoll, setLastDieRoll] = useState(0);

  // setLoading(false);

  function resetEventFlipper() {
    setEventFlipper(false);
  }

  useEffect(() => {
    console.log("Start of useEffect");

    const loadWallet = async () => {
      // TODO: Cleanup
      // setLoading(true);
      console.log("Loading wallet");
      const provider2 = new ethers.providers.Web3Provider(window.ethereum, "any");
      // Prompt user for account connections
      await provider2.send("eth_requestAccounts", []);
      playerSigner = provider2.getSigner();
      playerAddress = await playerSigner.getAddress();

      gameContract_write = new ethers.Contract(gameContractDeployData.address, gameContractDeployData.abi, playerSigner);
      charContract_write = new ethers.Contract(charContractDeployData.address, charContractDeployData.abi, playerSigner);

      // TODO: Find appropriate home
      gameContract_read.on("ActionCompleteEvent", (player, action, event) => {
        console.log("Event Player", player);
        console.log("Event Action", action);
        // console.log("Event", event);
        // updateDoorsFromChain();

        // updateBoardFromChain();
        // console.log("CurrentGameNumber", currentGameNumber);
        // updateRemotePlayers(currentGameNumber);
        setEventFlipper(true);
      })

      gameContract_read.on("DiceRollEvent", (roll, forValue, against, event) => {
        console.log("Roll Event roll", roll);
        // console.log("Roll event forValue", forValue);
        // console.log("Roll Event against", against);
        // console.log("Roll Event", event);
        setLastDieRoll(roll);
      })


      setWalletLoaded(true);
      setAppLoading(false);
    }

    // Call the function
    if (!walletLoaded) {
      console.log("Loading wallet")
      loadWallet();
    }

  }, [currentGameNumber, walletLoaded]);


  function renderApp() {
    if (appState === AppState.GAMES) {
      console.log("Rendering game");
      return (
        <GameBoard
        currentGameNumber={currentGameNumber}
        mapContract_read={mapContract_read}
        gameContract_read={gameContract_read}
        charContract_read={charContract_read}
        playerSignerAddress={playerAddress}
        gameContract_write={gameContract_write}
        eventFlipper={eventFlipper}
        resetEventFlipper={resetEventFlipper}
        lastDieRoll={lastDieRoll}
        setCurrentGameNumber={setCurrentGameNumber}
      />
      );
    } else if (appState === AppState.CHARS) {
      return (
        <Characters
          charContract_read={charContract_read}
          charContract_write={charContract_write}
          address={playerAddress}
        />
      )
    }

    return (<Box></Box>)
  }

  return ( appLoading ? <div>"Loading Wallet..."</div> :
    <div className="App">
      {renderApp()}
    </div>
  );
}

export default App;
