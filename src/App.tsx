import {Card, Tab, Tabs, Typography } from '@mui/material';
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
import actionsContractDeployData from "./deployments/Actions.json";
import utilsContractDeployData from "./deployments/BCUtils.json";
import playersContractDeployData from "./deployments/BCPlayers.json";

// import utilsContractDeployData from "./deployments/BCGames.json";
import mapsContractDeployData from "./deployments/Maps.json";
import lobbiesContractDeployData from "./deployments/Lobby.json";

import GameBoard from './components/Board';
import CharactersList from './components/CharactersList';
import GameList from './components/GameList';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { grey } from '@mui/material/colors';
import Info from './components/Info';
import ItemVault from './components/ItemVault';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

// TODO: Internet suggested hack to stop window.ethereum from being broken
declare var window: any;

// TODO: Keys are fine here but need to allowlist on Alchemy
// if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
//   var settings = {
//     apiKey: 'removed',
//     network: Network.MATIC_MUMBAI,
//   };
// } else {
//   var settings = {
//     apiKey: 'removed',
//     network: Network.MATIC_MUMBAI,
//   };
// }

// const alchemy = new Alchemy(settings);

// let provider: any;
let gameContract_read: ethers.Contract;
let lobbiesContract_read: ethers.Contract;
let charContract_read: ethers.Contract;
let mapContract_read: ethers.Contract;
let itemsContract_read: ethers.Contract;
let actionsContract_read: ethers.Contract;
let utilsContract_read: ethers.Contract;
let playersContract_read: ethers.Contract;

let playerSigner: any; //TODO: any
let gameContract_write: ethers.Contract;
let lobbiesContract_write: ethers.Contract;
let charContract_write: ethers.Contract;
let actionsContract_write: ethers.Contract;
let itemsContract_write: ethers.Contract;
let playersContract_write: ethers.Contract;

let playerAddress: string;

let provider: any; //TODO: any

function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [walletLoaded, setWalletLoaded] = useState(false);
  // const [provider, setProvider] = useState();
  const lastGameString = localStorage.getItem("lastGame");
  let lastGame: number;
  if (lastGameString == null) {
    lastGame = 0;
  } else {
    lastGame = parseInt(lastGameString);
  }
  const [currentGameNumber, setCurrentGameNumber] = useState(lastGame);
  const lastTabString = localStorage.getItem("lastTab");
  let lastTab: number;
  if(lastTabString == null) {
    lastTab = 0;
  } else {
    lastTab = parseInt(lastTabString)
  }
  const [tabValue, setTabValue] = useState(lastTab);


  const loadWallet = async () => {
    // TODO: Cleanup
    const walletProvider = new ethers.providers.Web3Provider(window.ethereum, "any");
    try {
      // send a request to the wallet to switch the network and select the Ethereum mainnet
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: ethers.utils.hexValue(80001),
          rpcUrls: ["https://rpc-mumbai.maticvigil.com"],
          chainName: "Polygon Testnet Mumbai",
          nativeCurrency: {
            name: "MATIC",
            symbol: "MATIC", // 2-6 characters long
            decimals: 18,
          },
          blockExplorerUrls: ["https://mumbai.polygonscan.com/"],
        }]
      })
    } catch (error: any) {
      if (error.code === 4001) {
        console.log("the user doesn't want to change the network!")
      }
      else if (error.code === 4902) {
        console.log("this network is not in the user's wallet")
      }
      else {
        console.log(`Error ${error.code}: ${error.message}`)
      }
    }

    // Prompt user for account connections
    walletProvider.send("eth_requestAccounts", []);
    playerSigner = walletProvider.getSigner();
    playerAddress = await playerSigner.getAddress();
    provider = playerSigner;

    // provider = await alchemy.config.getProvider();
    gameContract_read = new ethers.Contract(gameContractDeployData.address, gameContractDeployData.abi, provider);
    lobbiesContract_read = new ethers.Contract(lobbiesContractDeployData.address, lobbiesContractDeployData.abi, provider);
    charContract_read = new ethers.Contract(charContractDeployData.address, charContractDeployData.abi, provider);
    mapContract_read = new ethers.Contract(mapsContractDeployData.address, mapsContractDeployData.abi, provider);
    itemsContract_read = new ethers.Contract(itemsContractDeployData.address, itemsContractDeployData.abi, provider);
    actionsContract_read = new ethers.Contract(actionsContractDeployData.address, actionsContractDeployData.abi, provider);
    utilsContract_read = new ethers.Contract(utilsContractDeployData.address, utilsContractDeployData.abi, provider);
    playersContract_read = new ethers.Contract(playersContractDeployData.address, playersContractDeployData.abi, provider);

    gameContract_write = new ethers.Contract(gameContractDeployData.address, gameContractDeployData.abi, provider);
    charContract_write = new ethers.Contract(charContractDeployData.address, charContractDeployData.abi, provider);
    lobbiesContract_write = new ethers.Contract(lobbiesContractDeployData.address, lobbiesContractDeployData.abi, provider);
    actionsContract_write = new ethers.Contract(actionsContractDeployData.address, actionsContractDeployData.abi, provider);
    playersContract_write = new ethers.Contract(playersContractDeployData.address, playersContractDeployData.abi, provider);

    setWalletLoaded(true);
    setAppLoading(false);
  }

  useEffect(() => {
    console.log("Start of useEffect");

    if (!walletLoaded) {
      console.log("Loading wallet")
      loadWallet();
    }
  }, []);


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
    localStorage.setItem("lastTab", newValue.toString());
    setTabValue(newValue);
  }
  return (
    appLoading ?
      <ThemeProvider theme={theme}>
        <Typography variant="body1" align="left" color="white">
          Please connect or unlock your wallet.  Or wait for it to load.
        </Typography>
      </ThemeProvider>
      :
      <ThemeProvider theme={theme}>
        <div className="App">
          <Card>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={tabValue} onChange={handleChange} aria-label="App Mode Selection">
                <Tab label="Characters" {...a11yProps(0)} />
                <Tab label="Games List" {...a11yProps(1)} />
                <Tab label="Game" {...a11yProps(2)} />
                <Tab label="Lobbies" {...a11yProps(3)} />
                <Tab label="Info" {...a11yProps(4)} />
                <Tab label="Item Vault" {...a11yProps(5)} />
              </Tabs>
            </Box>
            <TabPanel value={tabValue} index={0}>
              <CharactersList
                charContract_read={charContract_read}
                charContract_write={charContract_write}
                lobbiesContract_write={lobbiesContract_write}
                itemsContract_read={itemsContract_read}
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
                gameContract_write={gameContract_write}
                charContract_read={charContract_read}
                itemContract_read={itemsContract_read}
                playerSignerAddress={playerAddress}
                actionsContract_write={actionsContract_write}
                actionsContract_read={actionsContract_read}
                playersContract_read={playersContract_read}
                playersContract_write={playersContract_write}
                utilsContract_read={utilsContract_read}
                setCurrentGameNumber={setCurrentGameNumber}
                walletLoaded={walletLoaded}
              />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              <Box>Lobbies (Not implemented)</Box>
            </TabPanel>
            <TabPanel value={tabValue} index={4}>
              <Info />
            </TabPanel>
            <TabPanel value={tabValue} index={5}>
              <ItemVault
                itemsContract_read={itemsContract_read}
                address={playerAddress}
              />
            </TabPanel>
            <Typography>Dev Notes</Typography>
            <Typography>UI/UX is temporary.  Feedback is not required.  I know ;)</Typography>
            <Typography>Pre-Alpha Test.  Bugs abound! Play at your own risk!  In-game NFTs will be reset regularly.  Use a dev wallet!</Typography>
            <Typography>A transaction that is expected to fail means bad input.  If transactions are failing after submission, try again with double the gas limit.</Typography>
          </Card>
        </div>
      </ThemeProvider>
  );
}

export default App;
