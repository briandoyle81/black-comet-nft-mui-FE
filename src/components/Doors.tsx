import Breached from "../assets/img/doors/breached.png";
import Green from "../assets/img/doors/green.png";
import Open from "../assets/img/doors/open.png";
import Red from "../assets/img/doors/red.png";
import Wall from "../assets/img/doors/wall.png";
import Window from "../assets/img/doors/window.png";
import { Box, Card, CardMedia, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

import BreachIcon from "../assets/img/misc/temp-flaticon-breach.png";
import HackIcon from "../assets/img/misc/temp-flaticon-hack.png";

export enum DoorStatus {
  NO_DOOR = 0,
  CLOSED,
  OPEN,
  BREACHED,
  WINDOW,
  PLACEHOLDER,
}

export interface DoorInterface {
  vsBreach: number;
  vsHack: number;
  status: DoorStatus;
  rotate: boolean;
}

const Rotated = styled(Card)(({ theme }) => ({
  transform: `rotate(90deg)`,
}));

const H_vsHack = styled(Typography)(({ theme }) => ({
  position: "absolute",
  top: "0px",
  left: "6px",
  color: "white",
  fontSize: 12,
}));

const H_vsBreach = styled(Typography)(({ theme }) => ({
  position: "absolute",
  top: "0px",
  right: "6px",
  color: "white",
  fontSize: 12,
}));

// TODO: Make text not sideways
// const V_vsHack = styled(Typography)(({ theme }) => ({
//   position: 'absolute',
//   top: '0px',
//   left: '0px',
//   color: 'white',
//   fontSize: 12
// }));

// const V_vsBreach = styled(Typography)(({ theme }) => ({
//   position: 'absolute',
//   bottom: '0px',
//   right: '0px',
//   color: 'white',
//   fontSize: 12
// }));

const ArtMap = {
  [DoorStatus.NO_DOOR]: Wall,
  [DoorStatus.CLOSED]: Red,
  [DoorStatus.OPEN]: Open,
  [DoorStatus.BREACHED]: Breached,
  [DoorStatus.WINDOW]: Window,
  [DoorStatus.PLACEHOLDER]: Wall,
};

export default function Door(props: DoorInterface) {
  function getDoorArt() {
    // if (props.vsBreach === 0) {
    //   return Breached;
    // }
    if (
      props.vsHack === 0 &&
      props.status !== DoorStatus.BREACHED &&
      props.status !== DoorStatus.OPEN
    ) {
      return Green;
    }

    // Otherwise, go with state
    return ArtMap[props.status];
  }

  function renderDoorStats(door: DoorInterface) {
    if (door.status === DoorStatus.OPEN || door.status === DoorStatus.CLOSED) {
      return (
        <Box>
          {/* <img
            src={HackIcon}
            alt="hack"
            style={{
              height: "20%",
              width: "20%",
              position: "absolute",
              top: "0px",
              left: "0px",
            }}
          /> */}
          <H_vsHack>{props.vsHack}</H_vsHack>
          <H_vsBreach>{props.vsBreach}</H_vsBreach>
          {/* <img
            src={BreachIcon}
            alt="breach"
            style={{
              height: "20%",
              width: "20%",
              position: "absolute",
              bottom: "0px",
              right: "0px",
            }}
          /> */}
        </Box>
      );
    } else {
      return <Box></Box>;
    }
  }

  // TODO: DRY/CLEANUP
  function renderDoor() {}
  // TODO: This method of rotation is adding padding and putting drop shadow in incorrect orientation
  if (props.status === DoorStatus.NO_DOOR) {
    return (
      <Grid item xs={0.5}>
        <Box></Box>
      </Grid>
    );
  } else if (props.rotate) {
    return (
      <Grid item xs={0.5} sx={{ display: "flex", alignItems: "center" }}>
        <Card sx={{ transform: `rotate(90deg)`, position: "relative" }}>
          <CardMedia image={getDoorArt()} component="img" />
          {renderDoorStats(props)}
        </Card>
      </Grid>
    );
  } else {
    return (
      <Grid item xs={0.5}>
        <Card sx={{ position: "relative" }}>
          <CardMedia image={getDoorArt()} component="img" />
          {renderDoorStats(props)}
        </Card>
      </Grid>
    );
  }
}
