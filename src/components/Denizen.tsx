import { Box, Card, CardMedia, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Position } from "./Utils";

import BugAlien from "../assets/img/chars/Bug_Alien.png";
import Scav from "../assets/img/chars/Scavenger.png";
import Turret from "../assets/img/chars/Turret.png";
import Sentry from "../assets/img/chars/Sentry.png";
import { DenizenInterface, DenizenType } from "./GamePanel";

const OnBoardDenizen = styled(Card)(({ theme }) => ({
  zIndex: 1299, // TODO
  width: "90%",
  height: "90%",
  // background: 'grey',
  border: "black",
}));

const Portrait = styled(Card)(({ theme }) => ({
  background: "gray",
  position: "relative",
}));

const PortraitStyle = {
  height: 150,
};

const OnBoardStyle = {
  zIndex: 1299, // TODO
  width: "100%",
};

const DenizenId = styled(Typography)(({ theme }) => ({
  position: "absolute",
  top: 0,
  right: 0,
  padding: 1,
  color: "white",
  background: "transparent",
  height: "20%",
}));

const DenizenHP = styled(Typography)(({ theme }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  padding: 1,
  color: "white",
  background: "transparent",
  height: "20%",
}));

// TODO: Move Denizen interface here

export interface DenizenProps {
  denizen: DenizenInterface;
  portrait: boolean;
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
        throw "ERROR: Missing denizen type";
    }
  }

  function getBackground() {
    switch (props.denizen.denizenType) {
      case DenizenType.BUG:
        return "lightgreen";
      case DenizenType.SCAV:
        return "gray";
      case DenizenType.TURRET:
        return "pink";
      case DenizenType.ROBOT:
        return "pink";
      default:
        throw "ERROR: Missing denizen type";
    }
  }

  function renderDenizen(portrait: boolean) {
    if (!portrait) {
      return (
        <OnBoardDenizen
          sx={{ position: "relative", background: getBackground() }}
        >
          <DenizenId
            sx={{
              fontSize: "0.75rem",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            {"#" + props.denizen.id.toString()}
          </DenizenId>
          <DenizenHP
            sx={{
              fontSize: "0.75rem",
              fontWeight: "bold",
              textAlign: "right",
            }}
          >
            {props.denizen.healthRemaining.toString()}
          </DenizenHP>
          <img src={getArt()} style={OnBoardStyle} alt="TODO Denizen" />
        </OnBoardDenizen>
      );
    } else {
      return (
        <Portrait>
          <CardMedia>
            <img src={getArt()} style={PortraitStyle} alt="TODO Denizen" />
            <DenizenId
              sx={{
                fontSize: "0.75rem",
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              {props.denizen.id.toString()}
            </DenizenId>
          </CardMedia>
        </Portrait>
      );
    }
  }

  return props.denizen.healthRemaining.toString() === "0" ? (
    <></>
  ) : (
    <Box>{renderDenizen(props.portrait)}</Box>
  );
}
