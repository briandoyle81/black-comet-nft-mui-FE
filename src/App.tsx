import {Tab, Tabs } from '@mui/material';
import React, { useEffect, useState } from 'react';
import './App.css';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import { ethers } from 'ethers';
import { Network, Alchemy } from 'alchemy-sdk';

// TODO: Figure out how to manage this automatically
import eventsDeployData from "./deployments/BCEvents.json";
import roomTilesContractDeployData from "./deployments/RoomTiles.json";
import charContractDeployData from "./deployments/BCChars.json";
import itemsContractDeployData from "./deployments/BCItems.json";
import gameContractDeployData from "./deployments/BCGames.json";
// import utilsContractDeployData from "./deployments/BCGames.json";
import mapsContractDeployData from "./deployments/Maps.json";
import lobbiesContractDeployData from "./deployments/Lobby.json";

import GameBoard from './components/Board';
import Characters from './components/Characters';
import GameList from './components/GameList';

// TODO: Internet suggested hack to stop window.ethereum from being broken
declare var window: any;

const settings = {
  apiKey: 'zp-Tq0B2ca_enpFDdUqiGjJnPD11sxQP', // Replace with your Alchemy API Key.
  network: Network.MATIC_MUMBAI, // Replace with your network.
};

const alchemy = new Alchemy(settings);

let provider: any;
let gameContract_read: ethers.Contract;
let lobbiesContract_read: ethers.Contract;
let charContract_read: ethers.Contract;
let mapContract_read: ethers.Contract;


// const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.g.alchemy.com/v2/zp-Tq0B2ca_enpFDdUqiGjJnPD11sxQP");

// const provider = new ethers.providers.AlchemyWebSocketProvider('maticmum', 'zp-Tq0B2ca_enpFDdUqiGjJnPD11sxQP');
// const provider = new ethers.providers.JsonRpcProvider("https://polygon-mumbai.infura.io/v3/357c214d39224c62ba25d2886bdf0a27");
// const provider = new ethers.providers.InfuraWebSocketProvider('maticmum', '357c214d39224c62ba25d2886bdf0a27')
// const debugSigner = new ethers.Wallet(process.env.REACT_APP_METAMASK_WALLET_1 as string, provider);
let playerSigner: any; //TODO: any
let gameContract_write: any; // TODO: any
let lobbiesContract_write: any;
let charContract_write: any;
let playerAddress: string;

// const roomTilesContract_read = new ethers.Contract(roomTilesContractDeployData.address, roomTilesContractDeployData.abi, provider);
// const gameContract_read = new ethers.Contract(gameContractDeployData.address, gameContractDeployData.abi, provider);
// const lobbiesContract_read = new ethers.Contract(lobbiesContractDeployData.address, lobbiesContractDeployData.abi, provider);
// const charContract_read = new ethers.Contract(charContractDeployData.address, charContractDeployData.abi, provider);
// const mapContract_read = new ethers.Contract(mapsContractDeployData.address, mapsContractDeployData.abi, provider);
// myContract_write = new ethers.Contract(address, abi, signer)    // Write only

// const gameEventFilter = {
//   address: gameContractDeployData.address,
//   topics: [
//     utils.id("DiceRollEvent(uint,uint)"),
//     utils.id("ActionCompleteEvent(BCTypes.Player,BCTypes.Action)")
//   ]
// }

function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [walletLoaded, setWalletLoaded] = useState(false);

  const [currentGameNumber, setCurrentGameNumber] = useState(0);

  const [eventFlipper, setEventFlipper] = useState(true);
  const [lastDieRoll, setLastDieRoll] = useState(0);

  const [tabValue, setTabValue] = useState(0);

  function resetEventFlipper() {
    setEventFlipper(false);
  }

  useEffect(() => {
    console.log("Start of useEffect");

    const loadWallet = async () => {
      // TODO: Cleanup
      // setLoading(true);
      console.log("Loading wallet");

      provider = await alchemy.config.getProvider();
      gameContract_read = new ethers.Contract(gameContractDeployData.address, gameContractDeployData.abi, provider);
      lobbiesContract_read = new ethers.Contract(lobbiesContractDeployData.address, lobbiesContractDeployData.abi, provider);
      charContract_read = new ethers.Contract(charContractDeployData.address, charContractDeployData.abi, provider);
      mapContract_read = new ethers.Contract(mapsContractDeployData.address, mapsContractDeployData.abi, provider);

      const walletProvider = new ethers.providers.Web3Provider(window.ethereum, "maticmum");
      // Prompt user for account connections
      await walletProvider.send("eth_requestAccounts", []);
      playerSigner = walletProvider.getSigner();
      playerAddress = await playerSigner.getAddress();

      gameContract_write = new ethers.Contract(gameContractDeployData.address, gameContractDeployData.abi, playerSigner);
      charContract_write = new ethers.Contract(charContractDeployData.address, charContractDeployData.abi, playerSigner);
      lobbiesContract_write = new ethers.Contract(lobbiesContractDeployData.address, lobbiesContractDeployData.abi, playerSigner);

      // // TODO: Find appropriate home
      gameContract_read.on("ActionCompleteEvent", (player, action, event) => {
        console.log("Event Player", player);
        console.log("Event Action", action);

        setEventFlipper(true);
      })

      gameContract_read.on("DiceRollEvent", (roll, forValue, against, event) => {
        console.log("Roll Event roll", roll);

        // TODO: This probably needs to say and filter based on which game number
        setLastDieRoll(roll);
      })


      setWalletLoaded(true);
      setAppLoading(false);
    }

    if (!walletLoaded) {
      console.log("Loading wallet")
      loadWallet();
    }

  }, [currentGameNumber, walletLoaded]);


  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Box>{children}</Box>
          </Box>
        )}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }
  return (appLoading ? <div>"Loading Wallet..."</div> :
    <div className="App">
      <Box>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleChange} aria-label="App Mode Selection">
            <Tab label="Characters" {...a11yProps(0)} />
            <Tab label="Games List" {...a11yProps(1)} />
            <Tab label="Game" {...a11yProps(2)} />
            <Tab label="Lobbies" {...a11yProps(3)} />
          </Tabs>
        </Box>
        <TabPanel value={tabValue} index={0}>
          <Characters
            charContract_read={charContract_read}
            charContract_write={charContract_write}
            lobbiesContract_write={lobbiesContract_write}
            address={playerAddress}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={1}>
          <GameList
            gameContract_read={gameContract_read}
            setCurrentGameNumber={setCurrentGameNumber}
            setTabValue={setTabValue}
            address={playerAddress}
          />
        </TabPanel>
        <TabPanel value={tabValue} index={2}>
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
        </TabPanel>
        <TabPanel value={tabValue} index={3}>
          <Box>Lobbies</Box>
        </TabPanel>
      </Box>
    </div>
  );
}

export default App;
