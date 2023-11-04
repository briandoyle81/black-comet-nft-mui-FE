import Breached from "../assets/img/doors/breached.png";
import Green from "../assets/img/doors/green.png";
import Open from "../assets/img/doors/open.png";
import Red from "../assets/img/doors/red.png";
import Wall from "../assets/img/doors/wall.png";
import Window from "../assets/img/doors/window.png";
import { Box, Card, CardMedia, Grid, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";

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

const HvsHack = styled(Typography)(({ theme }) => ({
  color: "white",
  fontSize: 12,
  fontWeight: "bold", // To make the text bold
  textShadow: "1px 1px 0px rgba(0, 0, 0, 0.3)", // 1-pixel drop-shadow
}));

const HvsBreach = styled(Typography)(({ theme }) => ({
  color: "white",
  fontSize: 12,
  fontWeight: "bold", // To make the text bold
  textShadow: "1px 1px 0px rgba(0, 0, 0, 0.3)", // 1-pixel drop-shadow
}));

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
        <Box position="absolute" top={0} left={0} right={0} bottom={0}>
          <Grid container>
            <Grid
              item
              xs={6}
              container
              alignItems="center"
              justifyContent="center"
            >
              <Box
                style={{
                  backgroundColor: "blue",
                  borderRadius: "50%", // To create a circle
                  width: "60%",
                  height: "60%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HvsHack>{props.vsHack}</HvsHack>
              </Box>
            </Grid>
            <Grid
              item
              xs={6}
              container
              alignItems="center"
              justifyContent="center"
            >
              <Box
                style={{
                  backgroundColor: "red",
                  width: "60%",
                  height: "60%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <HvsBreach>{props.vsBreach}</HvsBreach>
              </Box>
            </Grid>
          </Grid>
        </Box>
      );
    } else {
      return <Box></Box>;
    }
  }

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
