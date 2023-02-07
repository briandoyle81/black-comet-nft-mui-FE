import { Box, Card, CardMedia } from "@mui/material";
import { styled } from '@mui/material/styles';
import { Position } from './Utils';

import Archetype0 from "../assets/img/arch_svg/archetype_0";
import Archetype1 from "../assets/img/arch_svg/archetype_1";
import Archetype2 from "../assets/img/arch_svg/archetype_2";
import Archetype3 from "../assets/img/arch_svg/archetype_3";
import Archetype4 from "../assets/img/arch_svg/archetype_4";
import Archetype5 from "../assets/img/arch_svg/archetype_5";
import Archetype6 from "../assets/img/arch_svg/archetype_6";
import Archetype7 from "../assets/img/arch_svg/archetype_7";

export interface ArchetypeProps {
  pantsStyle: object,
  shirtStyle: object,
  bootsStyle: object,
  dirtStyle: object,
}

const PlayerOverlay = styled(Card)(({ theme }) => ({
  // position: 'absolute',
  // left: '-55%',
  // bottom: '-55%',
  scale: '30%',
  background: 'transparent'
}));

const PlayerStyle = {
  zIndex: 1299, // TODO
  width: '100%'
}

const Portrait = styled(Card)(({ theme }) => ({
  // scale: '50%',
  background: 'white'
}));

const ImageStyle = {
  height: 150
}

export interface PlayerInterface {
  remoteId: number;

  owner: string;
  charContractAddress: string;
  characterId: number;

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
  player?: PlayerInterface,
  portrait: boolean,
  genHash: string
}

export default function Player(props: PlayerProps) {

  function buildArchetype(genHash: string) {
    const colorString = "#" + props.genHash.slice(20, 26) // Block 5 - 2
    const builtProps: ArchetypeProps = {
      pantsStyle: { fill: colorString },
      shirtStyle: {},
      bootsStyle: {},
      dirtStyle: {},
    }

    return builtProps;
  }


  function getArt() {
    const archTypeString = props.genHash[4];

    console.log(props.genHash, props.genHash[4]);
    if (archTypeString === "0" || archTypeString === "1") {
      return (
        <Archetype0 {...buildArchetype(props.genHash)} />
      );
    } else if (archTypeString === "2" || archTypeString === "3") {
      return (
        <Archetype1 {...buildArchetype(props.genHash)} />
      );
    } else if (archTypeString === "4" || archTypeString === "5") {
      return (
        <Archetype2 {...buildArchetype(props.genHash)} />
      );
    } else if (archTypeString === "6" || archTypeString === "7") {
      return (
        <Archetype3 {...buildArchetype(props.genHash)} />
      );
    } else if (archTypeString === "8" || archTypeString === "9") {
      return (
        <Archetype4 {...buildArchetype(props.genHash)} />
      );
    } else if (archTypeString === "a" || archTypeString === "b") {
      return (
        <Archetype5 {...buildArchetype(props.genHash)} />
      );
    } else if (archTypeString === "c" || archTypeString === "d") {
      return (
        <Archetype6 {...buildArchetype(props.genHash)} />
      );
    } else if (archTypeString === "e" || archTypeString === "f") {
      return (
        <Archetype7 {...buildArchetype(props.genHash)} />
      );
    }
  }

  function renderPlayer(portrait: boolean) {
    if (!portrait) {
      return (

        // <img src={getArt()} style={PlayerStyle} alt="TODO PLAYER"/>
        getArt()
      )
    } else {
      return (
        <Portrait>
          <CardMedia>
            {/* <img src={getArt()} style={ImageStyle} alt="TODO" /> */}
            {getArt()}
          </CardMedia>
        </Portrait>
      )
    }
  }

  return (
    <Box>
      {renderPlayer(props.portrait)}
    </Box>
  )
}
