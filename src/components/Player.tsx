import Player0 from "../assets/img/chars/Nellie.png";
import Player1 from "../assets/img/chars/Amir.png";
import Player2 from "../assets/img/chars/Brock.png";
import Player3 from "../assets/img/chars/Doc.png";
import { Card, CardMedia } from "@mui/material";
import { styled } from '@mui/material/styles';
import { Position } from './Utils';

const PlayerOverlay = styled(Card)(({ theme }) => ({
  position: 'absolute',
  left: '-55%',
  bottom: '-55%',
  scale: '15%',
  background: 'transparent'
}));

export interface PlayerInterface {
  remoteId: number;

  owner: string;
  charContractAddress: string;
  characterId: number;

  position: Position;
  // 20,000 to write a word vs. 3 to add numbers, will not store updated characteristics
  healthDmgTaken: number;
  armorDmgTaken: number;
  actionsTaken: number;

  dataTokens: number;
  currentEffects: number[]; // Mark true if effect is present
  inventoryIDs: number[]; // TODO: figure out how to manage inventory

  // Flags
  canHarmOthers: boolean;
  dead: boolean;
}

export interface playerProps {
  player: PlayerInterface
}

export default function Player(props: PlayerInterface) {

  function getArtFromId() {
    // TODO: Create and get real NFT art
    if (props.remoteId == 0) {
      return Player0;
    } else if (props.remoteId == 1) {
      return Player1;
    } else if (props.remoteId == 2) {
      return Player2;
    } else if (props.remoteId == 3) {
      return Player3;
    } else {
      console.log("Bad Character ID:", props.remoteId)
      throw ("Bad Character ID");
    }
  }

  return (
    <PlayerOverlay>
      <CardMedia
        image={getArtFromId()}
        component="img"
      />
    </PlayerOverlay>
  )

}
