import { Button, Card, CardMedia, TextField, Typography } from '@mui/material';
import React, { ReactNode, useEffect, useState } from 'react';
import GamePanel, { GameInterface } from './GamePanel';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';



import { roomDisplayDataList } from './RoomTiles';


import Vent from "../assets/img/overlays/vent.png";
import Player, { PlayerInterface } from './Player';
import { Position } from './Utils';
import GameInfo from './GameInfo';

import Looted from '../assets/img/overlays/looted.png';
import BugIcon from '../assets/img/overlays/bug.png';
import MysteryIcon from '../assets/img/overlays/mystery.png';
import ScavIcon from '../assets/img/overlays/scav.png';
import ShipIcon from '../assets/img/overlays/ship.png';

import DataIcon from '../assets/img/overlays/data.png';
import ItemIcon from '../assets/img/overlays/item.png';

export enum EventType { NONE=0, BUG, MYSTERY, SCAVENGER, SHIP_SECURITY }

const TileOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: '0',
  top: '0',
  zIndex: 2000,
  background: 'transparent',
}));

const RoomName = styled(Typography)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  right: 0,
  padding: 5,
  color: 'white',
  background: 'transparent',
}));

export interface RoomTile {
  eventType: EventType;
  eventNum: number;

  numItems: number;
  numData: number;

  hasHazard: boolean;
  sigDetected: boolean;
}

export const EmptyRoomTile: RoomTile = {
  eventType: EventType.NONE,
  eventNum: 0,

  numItems: 0,
  numData: 0,

  hasHazard: false,
  sigDetected: false
}

export interface GameTileInterface {
  roomId: number,
  parentId: number,

  doors: number[],

  explored: boolean,
  looted: boolean,
  hasVent: boolean
}

export const EmptyTile: GameTileInterface = {
  roomId: 0,
  parentId: 0,

  doors: [],

  explored: false,
  looted: false,
  hasVent: false
}

export interface TilePropsInterface {
  tile: GameTileInterface;
  players: PlayerInterface[];
  row: number;
  col: number;
  currentGame: GameInterface;
  roomTiles: RoomTile[];
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

  function renderTopRowIcons() {
    const lootRenders: ReactNode[] = [];
    const roomId = props.tile.roomId;
    // const roomData = props.currentGame.
    // TODO: Don't show this if there was never loot?

    if (props.tile.looted) {
      lootRenders.push(
        <Grid item xs={3}>
          <img src={Looted} alt="Looted" style={{ width: '100%', zIndex: 2000 }} />
        </Grid>
      )
    } else {
      const roomData = props.roomTiles[props.tile.roomId];
      for (let i = 0; i < roomData.numItems; i++) {
        lootRenders.push(
          <Grid item xs={3}>
            <img src={ItemIcon} alt="Looted" style={{ width: '100%', zIndex: 2000 }} />
          </Grid>
        )
      }
      for (let i = 0; i < roomData.numData; i++) {
        lootRenders.push(
          <Grid item xs={3}>
            <img src={DataIcon} alt="Looted" style={{ width: '100%', zIndex: 2000 }} />
          </Grid>
        )
      }
    }

    // Fill out array for spacing
    while (lootRenders.length < 3) {
      lootRenders.push(<Grid item xs={3}></Grid>)
    }

    return (
      <Grid container>
        {lootRenders}
        {renderEventType()}
      </Grid>
    )


  }

  function renderEventType() {
    const roomData = props.roomTiles[props.tile.roomId];

    if (roomData.eventType === EventType.NONE) {
      return (
        <Grid item xs={3}>

        </Grid>
      )
    } else if (roomData.eventType === EventType.BUG) {
      return (
        <Grid item xs={3}>
          <img src={BugIcon} alt="Bug Event" style={{ width: '100%', zIndex: 2000 }} />
        </Grid>
      )
    } else if (roomData.eventType === EventType.MYSTERY) {
      return (
        <Grid item xs={3}>
          <img src={MysteryIcon} alt="Mystery Event" style={{ width: '100%', zIndex: 2000 }} />
        </Grid>
      )
    } else if (roomData.eventType === EventType.SCAVENGER) {
      return (
        <Grid item xs={3}>
          <img src={ScavIcon} alt="Scavenger Event" style={{ width: '100%', zIndex: 2000 }} />
        </Grid>
      )
    } else if (roomData.eventType === EventType.SHIP_SECURITY) {
      return (
        <Grid item xs={3}>
          <img src={ShipIcon} alt="Ship Security Event" style={{ width: '100%', zIndex: 2000 }} />
        </Grid>
      )
    } else {
      return (<Grid item xs={3}></Grid>)
    }
  }

  function renderOverlays(position: Position) {
    const playerRenders: ReactNode[] = [];
    // console.log(players.length || "no players")
    // TODO: Why isn't the loading mechanism catching no players?
    if (props.players.length > 0) {
      props.players.forEach((player: PlayerInterface, index) => { // TODO: any
        // console.log(position, player.position)
        if (position.row === player.position.row && position.col === player.position.col) {
          playerRenders.push(
            <Grid item xs={3} key={index + "player"}>
              <Player {...{ player: player, portrait: false }} />
            </Grid>
          )
            ;
        }
      });
    }

    return (
      <TileOverlay>
        <Grid container>
          <Grid item xs={12}>
            {renderTopRowIcons()}
          </Grid>
          <Grid item xs={12}>
            <Grid container>
              {playerRenders}
            </Grid>
          </Grid>
        </Grid>
      </TileOverlay>
    );
  }

  function renderVent(vent: boolean) {
    if (vent) {
      return (
        <VentOverlay>
          <CardMedia
            image={Vent}
            component="img"
          />
        </VentOverlay>
      )
    } else {
      return (<Box></Box>)
    }
  }

  return (
    <Card sx={{ position: 'relative' }}>
      <CardMedia
        image={roomDisplayDataList[props.tile.roomId].art}
        component="img"
      />
      <RoomName sx={{ fontSize: '0.5rem', fontWeight: 'bold', textAlign: 'right' }}>{roomDisplayDataList[props.tile.roomId].name}</RoomName>
      {renderVent(props.tile.hasVent)}
      {renderOverlays({ row: props.row, col: props.col })}
    </Card>
  )
}
