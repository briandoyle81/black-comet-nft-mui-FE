import { Button, Card, CardMedia, TextField } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';
import GamePanel, { GameInterface } from './GamePanel';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

import { ethers, utils } from 'ethers';

import { roomDisplayDataList } from './RoomTiles';

import { DoorInterface, DoorStatus } from './Doors';

import Door from "./Doors";

import Vent from "../assets/img/overlays/vent.png";
import Player, { PlayerInterface } from './Player';
import { Position } from './Utils';
import GameInfo from './GameInfo';
import { GameTileInterface } from './Board';

const EmptyTile: GameTileInterface = {
  roomId: 0,
  parentId: 0,

  doors: [],

  explored: false,
  looted: false,
  hasVent: false
}

export interface TilePropsInterface {

}

// TODO: Why does it need negative, and why does it change size/scale
// TODO: Move to component?  Maybe move tiles to component
const VentOverlay = styled(Card)(({ theme }) => ({
  position: 'absolute',
  left: '-55%',
  bottom: '-55%',
  scale: '15%'
}));

export default function Tile(props: TilePropsInterface) {
    const [gameTiles, setGameTiles] = useState(Array.from({ length: n }, () => Array.from({ length: n }, () => EmptyTile)));

}
