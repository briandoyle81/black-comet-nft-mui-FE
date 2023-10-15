import React, { useEffect, useState } from "react";

import { Box, Card, CardMedia } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Position } from "../utils/Utils";

import Archetype0 from "../assets/img/arch_svg/archetype_0";
import Archetype1 from "../assets/img/arch_svg/archetype_1";
import Archetype2 from "../assets/img/arch_svg/archetype_2";
import Archetype3 from "../assets/img/arch_svg/archetype_3";
import Archetype4 from "../assets/img/arch_svg/archetype_4";
import Archetype5 from "../assets/img/arch_svg/archetype_5";
import Archetype6 from "../assets/img/arch_svg/archetype_6";
import Archetype7 from "../assets/img/arch_svg/archetype_7";
import { TraitsInterface } from "./Board";

const ARCHETYPE_HEIGHT = 455;

// Names must be lowercase to keep React from getting upset about custom
// attributes in the DOM
export interface ArchetypeProps {
  clothingcolor: object;
  clothinglowlight: object;
  clothinghightlight: object;
  dirtstyle: object;
}

const OnBoardPlayer = styled(Card)(({ theme }) => ({
  zIndex: 1299, // TODO
  width: "90%",
  background: "white",
  border: "black",
}));

const Portrait = styled(Card)(({ theme }) => ({
  background: "white",
  border: "none",
  boxShadow: "none",
}));

const BoxContainer = styled(Box)(({ theme }) => ({
  height: `${ARCHETYPE_HEIGHT}px`,
  backgroundColor: `white`,
  borderRadius: "4px",
}));

export interface PlayerInterface {
  owner: string;
  characterId: number;

  id: number;

  currentTraits: TraitsInterface;

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
  player?: PlayerInterface;
  portrait: boolean;
  genHash: string;
}

// TODO: Move to utils and refine

function changeColor(color: string, amount: number) {
  // #FFF not supported rather use #FFFFFF
  const clamp = (val: number) => Math.min(Math.max(val, 0), 0xff);
  const fill = (str: string) => ("00" + str).slice(-2);

  const num = parseInt(color.substr(1), 16);
  const red = clamp((num >> 16) + amount);
  const green = clamp(((num >> 8) & 0x00ff) + amount);
  const blue = clamp((num & 0x0000ff) + amount);
  return (
    "#" +
    fill(red.toString(16)) +
    fill(green.toString(16)) +
    fill(blue.toString(16))
  );
}

export default function Player(props: PlayerProps) {
  function buildArchetype(genHash: string) {
    const colorString = "#" + props.genHash.slice(20, 26); // Block 5 - 2 // TODO: Library
    const builtProps: ArchetypeProps = {
      clothingcolor: { fill: colorString },
      clothinglowlight: { fill: changeColor(colorString, -100) },
      clothinghightlight: { fill: changeColor(colorString, 50) },
      dirtstyle: {},
    };

    return builtProps;
  }

  function getArt() {
    const archTypeString = props.genHash[4];

    // console.log(props.genHash, props.genHash[4]);
    if (archTypeString === "0" || archTypeString === "1") {
      return <Archetype0 {...buildArchetype(props.genHash)} />;
    } else if (archTypeString === "2" || archTypeString === "3") {
      return <Archetype1 {...buildArchetype(props.genHash)} />;
    } else if (archTypeString === "4" || archTypeString === "5") {
      return <Archetype2 {...buildArchetype(props.genHash)} />;
    } else if (archTypeString === "6" || archTypeString === "7") {
      return <Archetype3 {...buildArchetype(props.genHash)} />;
    } else if (archTypeString === "8" || archTypeString === "9") {
      return <Archetype4 {...buildArchetype(props.genHash)} />;
    } else if (archTypeString === "a" || archTypeString === "b") {
      return <Archetype5 {...buildArchetype(props.genHash)} />;
    } else if (archTypeString === "c" || archTypeString === "d") {
      return <Archetype6 {...buildArchetype(props.genHash)} />;
    } else if (archTypeString === "e" || archTypeString === "f") {
      return <Archetype7 {...buildArchetype(props.genHash)} />;
    }
  }

  function renderPlayer(portrait: boolean) {
    if (!portrait) {
      return <OnBoardPlayer>{getArt()}</OnBoardPlayer>;
    } else {
      return <Portrait>{getArt()}</Portrait>;
    }
  }

  if (!props.portrait) {
    return <Box>{renderPlayer(props.portrait)}</Box>;
  }
  return <BoxContainer>{renderPlayer(props.portrait)}</BoxContainer>;
}
