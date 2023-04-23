import { Box, Card, CardMedia } from "@mui/material";
import { styled } from '@mui/material/styles';
import { Position } from './Utils';

import BugAlien from "../assets/img/chars/Bug_Alien.png";
import Scav from "../assets/img/chars/Scavenger.png";
import Turret from "../assets/img/chars/Turret.png";
import Sentry from "../assets/img/chars/Sentry.png";
import { DenizenInterface, DenizenType } from "./GamePanel";


const OnBoardDenizen = styled(Card)(({ theme }) => ({
  zIndex: 1299, // TODO
  width: '90%',
  height: '90%',
  background: 'gray',
  border: 'black'
}));

const Portrait = styled(Card)(({ theme }) => ({
  background: 'gray'
}));

const PortraitStyle = {
  height: 150
}

const OnBoardStyle = {
  zIndex: 1299, // TODO
  width: '100%'
}

// TODO: Move Denizen interface here

export interface DenizenProps {
  denizen: DenizenInterface,
  portrait: boolean,
}

export default function Denizen(props: DenizenProps) {


  function getArt() {
    switch (props.denizen.denizenType) {
      case DenizenType.BUG:
        return BugAlien;
      case DenizenType.SCAV:
        return Scav;
      case DenizenType.TURRET:
        return Turret;
      case DenizenType.ROBOT:
        return Sentry;
      default:
       throw("ERROR: Missing denizen type");
    }
  }

  function renderDenizen(portrait: boolean) {
    if (!portrait) {
      return (

        <OnBoardDenizen>
          <img src={getArt()} style={OnBoardStyle} alt="TODO Denizen"/>
       </OnBoardDenizen>

      )
    } else {
      return (
        <Portrait>
          <CardMedia>
            <img src={getArt()} style={PortraitStyle} alt="TODO Denizen"/>
          </CardMedia>
        </Portrait>
      )
    }
  }

  return (
    <Box>
      {renderDenizen(props.portrait)}
    </Box>
  )
}
