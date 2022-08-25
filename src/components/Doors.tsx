import React, { useEffect, useState } from 'react';

import Breached from "../assets/img/doors/breached.png";
import Green from "../assets/img/doors/green.png";
import Open from "../assets/img/doors/breached.png";
import Red from "../assets/img/doors/red.png";
import Wall from "../assets/img/doors/wall.png";
import Window from "../assets/img/doors/window.png";
import { Card, CardMedia, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';

export enum DoorStatus { NO_DOOR = 0, CLOSED, OPEN, BREACHED, WINDOW, PLACEHOLDER }

export interface DoorInterface {
  vsBreach: number;
  vsHack: number;
  status: DoorStatus;
  rotate: boolean
}

const Rotated = styled(Card)(({ theme }) => ({
  transform: `rotate(90deg)`
}));

const ArtMap = {
  [DoorStatus.NO_DOOR]: Wall,
  [DoorStatus.CLOSED]: Red,
  [DoorStatus.OPEN]: Open,
  [DoorStatus.BREACHED]: Breached,
  [DoorStatus.WINDOW]: Window,
  [DoorStatus.PLACEHOLDER]: Wall
}

export default function Door(props: DoorInterface) {

  function getDoorArt() {
    if (props.vsBreach === 0) {
      return Breached;
    }
    if (props.vsHack === 0) {
      return Green;
    }

    // Otherwise, go with state
    return ArtMap[props.status];
  }

  if (props.rotate) {
    return (
      <Grid item xs={.5} sx={{display: 'flex', alignItems: 'center'}}>
        <Card sx={{transform: `rotate(90deg)`}}>
          <CardMedia
            image={getDoorArt()}
            component="img"
          />
        </Card>
      </Grid>
    )
  } else {
    return (
      <Grid item xs={.5}>
        <Card>
          <CardMedia
            image={getDoorArt()}
            component="img"
          />
        </Card>
      </Grid>
    )
  }
}
