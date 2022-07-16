import { constants } from "crypto";
import Armory from "../assets/img/Armory[face].png"
import AuxiliaryReactor from "../assets/img/Auxiliary Reactor[face].png"
import BreachedReactor from "../assets/img/Breached Reactor[face].png"
import TileBack from "../assets/img/tile_back.png"

interface roomDisplayData {
  name: string;
  desc: string;
  art: string;
}

let roomDisplayDataList: roomDisplayData[] = []

roomDisplayDataList.push({
  name: "Armory",
  desc: "There are lots of guns here",
  art: Armory
});
  roomDisplayDataList.push({
  name: "Auxiliary Reactor",
  desc: "It's hot!",
  art: AuxiliaryReactor
  });

export { roomDisplayDataList }
