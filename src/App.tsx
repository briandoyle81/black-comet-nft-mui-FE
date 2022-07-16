import { Card, Paper } from '@mui/material';
import React, { useEffect, useState } from 'react';
import './App.css';
import GamePanel from './components/GamePanel';

// import { Image } from 'mui-image';

import CoinbaseWalletSDK from '@coinbase/wallet-sdk'
import Web3 from 'web3'

import { AbiItem } from 'web3-utils'

// IMPORTANT:  ABI is in another folder!!!
// TODO: Move to .env
import roomTilesContractDeployData from "./RoomTiles.json"
import { EthereumAddressFromSignedMessageResponse } from '@coinbase/wallet-sdk/dist/relay/Web3Response';

import TileBack from "./assets/img/tile_back.png"
import { roomDisplayDataList } from './components/RoomTiles';

const APP_NAME = 'My Awesome App'
const APP_LOGO_URL = 'https://example.com/logo.png'
const DEFAULT_ETH_JSONRPC_URL = 'https://mainnet.infura.io/v3/<YOUR_INFURA_API_KEY>'
const DEFAULT_CHAIN_ID = 1

// TODO: Move to .env
const ROOM_TILES_CONTRACT_ADDRESS = "0x034d0C06516D2c2E6ea4Ca1d6d2877722Dc7A685";



// Initialize Coinbase Wallet SDK
export const coinbaseWallet = new CoinbaseWalletSDK({
  appName: APP_NAME,
  appLogoUrl: APP_LOGO_URL,
  darkMode: false
})

// Initialize a Web3 Provider object
export const ethereum = coinbaseWallet.makeWeb3Provider(DEFAULT_ETH_JSONRPC_URL, DEFAULT_CHAIN_ID)

// Initialize a Web3 object
export const web3 = new Web3(ethereum as any)

const roomTilesContract = new web3.eth.Contract(roomTilesContractDeployData.abi as AbiItem[], ROOM_TILES_CONTRACT_ADDRESS)

async function getTileInformation(id: number) {
  const roomTile = await roomTilesContract.methods.roomTiles(id).call()
  const roomBase = await roomTilesContract.methods.roomBases(roomTile.roomBase).call()
  console.log("roomTile", roomTile);
  console.log("roomBase", roomBase);
  return roomBase.art
}

function App() {
  const tempLink = require("./assets/img/Auxiliary Reactor[face].png")

  const [loading, setLoading] = useState(false)
  const [artLink, setArtLink] = useState(TileBack);

  useEffect(() => {
    const loadImageLink = async () => {
      setLoading(true);

      // Await make wait until that
      // promise settles and return its result
      const roomTile = await roomTilesContract.methods.roomTiles(0).call()
      const baseArtLink = roomDisplayDataList[parseInt(roomTile.roomBase)].art
      console.log("Base art link", baseArtLink)
      // After fetching data stored it in posts state.
      setArtLink(baseArtLink);

      // Closed the loading page
      setLoading(false);
    }

    // Call the function
    loadImageLink();
    }, []);


  return (
    <div className="App">
      <Paper>
        <Card>
          <GamePanel />
          <div>
            {loading ? (<h4>Loading...</h4>) : (<img src={artLink} alt="temp"/>)}
          </div>
        </Card>
      </Paper>
    </div>
  );
}

export default App;
