import Player0 from "../assets/img/chars/Nellie.png";
import Player1 from "../assets/img/chars/Amir.png";
import Player2 from "../assets/img/chars/Brock.png";
import Player3 from "../assets/img/chars/Doc.png";
import { Box, Card, CardMedia } from "@mui/material";
import { styled } from '@mui/material/styles';
import { Position } from './Utils';

const PlayerOverlay = styled(Card)(({ theme }) => ({
  // position: 'absolute',
  // left: '-55%',
  // bottom: '-55%',
  scale: '30%',
  background: 'transparent'
}));

const PlayerStyle = {
  zIndex: 1299, // TODO
  width: '100%'
}

const Portrait = styled(Card)(({ theme }) => ({
  // scale: '50%',
  background: 'white'
}));

const ImageStyle = {
  height: 150
}

export interface PlayerInterface {
  remoteId: number;

  owner: string;
  charContractAddress: string;
  characterId: number;

  position: Position;
  // 20,000 to write a word vs. 3 to add numbers, will not store updated characteristics
  healthDmgTaken: number;
  armorDmgTaken: number; // TODO: revise this system
  actionsTaken: number;

  dataTokens: number;
  currentEffects: number[]; // Mark true if effect is present
  inventoryIDs: number[]; // TODO: figure out how to manage inventory

  // Flags
  canHarmOthers: boolean;
  dead: boolean;
}

export interface PlayerProps {
  player: PlayerInterface,
  portrait: boolean
}

export default function Player(props: PlayerProps) {

  function getArtFromId() {
    // TODO: Create and get real NFT art
    // TODO: Handle more than four players
    const tempId = props.player.remoteId % 4;
    if (tempId == 0) { // DO NOT USE ===!  Comparing number to bigNumber
      return Player0;
    } else if (tempId == 1) {
      return Player1;
    } else if (tempId == 2) {
      return Player2;
    } else if (tempId == 3) {
      return Player3;
    } else {
      console.log("Bad Character ID:", props.player.remoteId)
      throw ("Bad Character ID");
    }
  }

  function renderPlayer(portrait: boolean) {
    if (!portrait) {
      return (

          <img src={getArtFromId()} style={PlayerStyle} alt="TODO PLAYER"/>

      )
    } else {
      return (
        <Portrait>
          <CardMedia>
            <img src={getArtFromId()} style={ImageStyle} alt="TODO"/>
          </CardMedia>
        </Portrait>
      )
    }
  }

  return (
    <Box>
      { renderPlayer(props.portrait) }
    </Box>
  )
}
