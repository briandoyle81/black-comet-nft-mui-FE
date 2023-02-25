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
import { CharInterface } from './Board';
import { Position } from './Utils';
import GameInfo from './GameInfo';

import Looted from '../assets/img/overlays/looted.png';
import BugIcon from '../assets/img/overlays/bug.png';
import MysteryIcon from '../assets/img/overlays/mystery.png';
import ScavIcon from '../assets/img/overlays/scav.png';
import ShipIcon from '../assets/img/overlays/ship.png';

import DataIcon from '../assets/img/overlays/data.png';
import ItemIcon from '../assets/img/overlays/item.png';

import Hazard from '../assets/img/overlays/hazard.png';

export enum EventType { NONE=0, BUG, MYSTERY, SCAVENGER, SHIP_SECURITY }

const TileOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: '0',
  top: '0',
  zIndex: 1299,
  background: 'transparent',
}));

const BottomOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  left: '0',
  bottom: '0',
  zIndex: 1299,
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

  // hasHazard: boolean;
  sigDetected: boolean;
}

export const EmptyRoomTile: RoomTile = {
  eventType: EventType.NONE,
  eventNum: 0,

  numItems: 0,
  numData: 0,

  // hasHazard: false,
  sigDetected: false
}

export interface GameTileInterface {
  roomId: number,
  parentId: number,

  doors: number[],

  explored: boolean,
  looted: boolean,
  hasVent: boolean,
  hasHazard: false
}

export const EmptyTile: GameTileInterface = {
  roomId: 0,
  parentId: 0,

  doors: [],

  explored: false,
  looted: false,
  hasVent: false,
  hasHazard: false
}

export interface TilePropsInterface {
  tile: GameTileInterface;
  players: PlayerInterface[];
  chars: CharInterface[];
  row: number;
  col: number;
  currentGame: GameInterface;
  roomTiles: RoomTile[];
  roomsWithItems: Position[];
}

export default function Tile(props: TilePropsInterface) {

  function renderTopRowIcons() {
    const lootRenders: ReactNode[] = [];
    const roomId = props.tile.roomId;
    // const roomData = props.currentGame.
    // TODO: Don't show this if there was never loot?

    if (props.tile.looted) {
      lootRenders.push(
        <Grid item xs={3} key={(lootRenders.length-1)+"looted"}>
          <img src={Looted} alt="Looted" style={{ width: '100%', zIndex: 1299 }} />
        </Grid>
      )
    } else {
      // TODO: Hack for having made 100 be ID for main reactor
      const roomId = props.tile.roomId === 100 ? 1 : props.tile.roomId;
      const roomData = props.roomTiles[roomId];
      for (let i = 0; i < roomData.numItems; i++) {
        lootRenders.push(
          <Grid item xs={3} key={(lootRenders.length-1)+"item"}>
            <img src={ItemIcon} alt="Looted" style={{ width: '100%', zIndex: 1299 }} />
          </Grid>
        )
      }
      for (let i = 0; i < roomData.numData; i++) {
        lootRenders.push(
          <Grid item xs={3} key={(lootRenders.length-1)+"data"}>
            <img src={DataIcon} alt="Looted" style={{ width: '100%', zIndex: 1299 }} />
          </Grid>
        )
      }
    }

    // Fill out array for spacing
    while (lootRenders.length < 3) {
      lootRenders.push(<Grid item xs={3} key={(lootRenders.length-1)+"empty"}></Grid>)
    }

    return (
      <Grid container>
        {lootRenders}
        {renderEventType()}
      </Grid>
    )


  }

  function renderEventType() {
    // TODO: Hack for having made 100 be ID for main reactor
    const roomId = props.tile.roomId === 100 ? 1 : props.tile.roomId;
    const roomData = props.roomTiles[roomId];

    if (roomData.eventType === EventType.NONE) {
      return (
        <Grid item xs={3}>

        </Grid>
      )
    } else if (roomData.eventType === EventType.BUG) {
      return (
        <Grid item xs={3}>
          <img src={BugIcon} alt="Bug Event" style={{ width: '100%', zIndex: 1299 }} />
        </Grid>
      )
    } else if (roomData.eventType === EventType.MYSTERY) {
      return (
        <Grid item xs={3}>
          <img src={MysteryIcon} alt="Mystery Event" style={{ width: '100%', zIndex: 1299 }} />
        </Grid>
      )
    } else if (roomData.eventType === EventType.SCAVENGER) {
      return (
        <Grid item xs={3}>
          <img src={ScavIcon} alt="Scavenger Event" style={{ width: '100%', zIndex: 1299 }} />
        </Grid>
      )
    } else if (roomData.eventType === EventType.SHIP_SECURITY) {
      return (
        <Grid item xs={3}>
          <img src={ShipIcon} alt="Ship Security Event" style={{ width: '100%', zIndex: 1299 }} />
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
              <Player
                {...{
                  player: player,
                  portrait: false,
                  genHash: props.chars[index].genHash, // TODO: I'm not 100% sure this is the right hash
                }
                }
              />
            </Grid>
          )
            ;
        }
      });
    }

    return (
      <Box>
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
        <BottomOverlay>
          {renderBottomRowIcons()}
        </BottomOverlay>
      </Box>
    );
  }

  function renderBottomRowIcons() {
    const iconRenders: ReactNode[] = [];
    if (props.tile.hasVent) {
      iconRenders.push(
        <Grid item xs={3} key={(iconRenders.length - 1) + "bottom_icon"}>
          <img src={Vent} alt="Vent" style={{ width: '100%', zIndex: 1299 }} />
        </Grid>
      )
    }

    if (props.tile.hasHazard) {
      iconRenders.push(
        <Grid item xs={3} key={(iconRenders.length - 1) + "bottom_icon"}>
          <img src={Hazard} alt="Hazard" style={{ width: '100%', zIndex: 1299 }} />
        </Grid>
      )
    }

    const tilePosition = { row: props.row, col: props.col };
    let hasItem = false;
    for (let pos of props.roomsWithItems) {
      if (pos.row === tilePosition.row && pos.col === tilePosition.col) {
        hasItem = true;
      }
    }
    if (hasItem) {
      iconRenders.push(
        <Grid item xs={3} key={(iconRenders.length - 1) + "bottom_icon"}>
          <img src={ItemIcon} alt="Item" style={{ width: '100%', zIndex: 1299 }} />
        </Grid>
      )
    }

    return (
      <Grid container>
        {iconRenders}
      </Grid>
    )
  }

  function renderTile() {
    if (props.tile.roomId === 0) {
      return (
        <Box></Box>
      )
    } else {
      return (
        <Card sx={{ position: 'relative' }}>
          <CardMedia
            image={roomDisplayDataList[props.tile.roomId].art}
            component="img"
          />
          <RoomName sx={{ fontSize: '0.5rem', fontWeight: 'bold', textAlign: 'right' }}>{roomDisplayDataList[props.tile.roomId].name}</RoomName>
          {renderOverlays({ row: props.row, col: props.col })}
        </Card>
      )
    }
  }

  return (
    <Box key={props.row+","+props.col+"-tile-box"}>
      { renderTile() }
    </Box>
  )
}
