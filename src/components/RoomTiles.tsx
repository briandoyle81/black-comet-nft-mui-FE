import Space from "../assets/img/room-bg/space.png";
import Unexplored from "../assets/img/room-bg/tile_back.png";

import Donghaijiu from "../assets/img/room-bg/donghaijiu.png";

import Armory from "../assets/img/room-bg/Armory[face].png";
import AuxiliaryReactor from "../assets/img/room-bg/Auxiliary Reactor[face].png";
import BreachedReactor from "../assets/img/room-bg/Breached Reactor[face].png";
import Bridge from "../assets/img/room-bg/Bridge[face].png";
import BugNest from "../assets/img/room-bg/Bug Nest[face].png";
import CaptainsQuarters from "../assets/img/room-bg/Captain_s Quarters[face].png";
import CargoHold from "../assets/img/room-bg/Cargo Hold[face].png";
import CloneRoom from "../assets/img/room-bg/Clone Room[face].png";
import ComputerMainframe from "../assets/img/room-bg/Computer Mainframe[face].png";
import Crossroads from "../assets/img/room-bg/Crossroads[face].png";
import EngCatwalk from "../assets/img/room-bg/Eng. Catwalk[face].png";
import EscapePods from "../assets/img/room-bg/Escape Pods[face].png";
import Galley from "../assets/img/room-bg/Galley[face].png";
import HullBreach from "../assets/img/room-bg/Hull Breach[face].png";
import LHallway from "../assets/img/room-bg/L Hallway[face].png";
import MainReactor from "../assets/img/room-bg/Main Reactor[face].png";
import MainReactorBack from "../assets/img/room-bg/Main Reactor[back].png";
import Medbay from "../assets/img/room-bg/Medbay[face].png";
import Observation from "../assets/img/room-bg/Observation[face].png";
import OfficersBunk from "../assets/img/room-bg/Officer_s Bunk[face].png";
import Pantry from "../assets/img/room-bg/Pantry[face].png";
import PumpRoom from "../assets/img/room-bg/Pump Room[face].png";
import ReactorControl from "../assets/img/room-bg/Reactor Control[face].png";
import ScavengersDen from "../assets/img/room-bg/Scavenger_s Den[face].png";
import Scullery from "../assets/img/room-bg/Scullery[face].png";
import Showers from "../assets/img/room-bg/Showers[face].png";
import TorpedoTube from "../assets/img/room-bg/Torpedo Tube[face].png";
import TrashCompactor from "../assets/img/room-bg/Trash Compactor[face].png";

interface roomDisplayData {
  id: number;
  name: string;
  desc: string;
  art: string;
}

export const USABLE_ROOMS = [13, 19];

let roomDisplayDataList: roomDisplayData[] = [];
// TODO: Critical -> Don't rely on order assumption here, add room id number
roomDisplayDataList.push({
  id: 0,
  name: "Empty Space",
  desc: "There is nothing here.",
  art: Space,
});
roomDisplayDataList.push({
  id: 1,
  name: "Unexplored Room",
  desc: "This room has not been explored.",
  art: Unexplored,
});
roomDisplayDataList.push({
  id: 2,
  name: "Donghaijiu",
  desc: "Your home away from home.  It even has roaches!",
  art: Donghaijiu,
});
roomDisplayDataList.push({
  id: 3,
  name: "Armory",
  desc: "There are lots of guns here.  Most are locked away.",
  art: Armory,
});
roomDisplayDataList.push({
  id: 4,
  name: "Auxiliary Reactor",
  desc: "It seems to be running normally.",
  art: AuxiliaryReactor,
});
roomDisplayDataList.push({
  id: 5,
  name: "Breached Reactor",
  desc: "It's on fire!",
  art: BreachedReactor,
});
roomDisplayDataList.push({
  id: 6,
  name: "Bridge",
  desc: "The display panels occasionally flicker, showing brief glimpses of arcane symbols.",
  art: Bridge,
});
roomDisplayDataList.push({
  id: 7,
  name: "Bug Nest",
  desc: "The eggs glow gently.  Every once in awhile, one shivers.",
  art: BugNest,
});
roomDisplayDataList.push({
  id: 8,
  name: "Captain's Quarters",
  desc: "These are the biggest personal rooms you've ever seen.",
  art: CaptainsQuarters,
});
roomDisplayDataList.push({
  id: 9,
  name: "Cargo Hold",
  desc: "Sadly, most of the cargo is in impenetrable crates molecularly adhered to the deck.",
  art: CargoHold,
});
roomDisplayDataList.push({
  id: 10,
  name: "Clone Room",
  desc: "You can't quite see what is being cloned.  This is probably for the best.",
  art: CloneRoom,
});
roomDisplayDataList.push({
  id: 11,
  name: "Computer Mainframe",
  desc: "The vast computer blinks and beeps softly.",
  art: ComputerMainframe,
});
roomDisplayDataList.push({
  id: 12,
  name: "Crossroads",
  desc: "The piles of trash tell you that Scavengers often pass through.",
  art: Crossroads,
});
roomDisplayDataList.push({
  id: 13,
  name: "Engineering Catwalk",
  desc: "You can see the main reactor below.  You could jump down, but you don't see a way back up./n/nUse:  Move to the Main Reactor.",
  art: EngCatwalk,
});
roomDisplayDataList.push({
  id: 14,
  name: "Escape Pods",
  desc: "Most of the pods are missing, the rest are sealed behind reinforced doors.",
  art: EscapePods,
});
roomDisplayDataList.push({
  id: 15,
  name: "Galley",
  desc: "Rotten food coats every surface.",
  art: Galley,
});
roomDisplayDataList.push({
  id: 16,
  name: "Hull Breach",
  desc: "You can barely walk through the twisted mess of panels and beams.",
  art: HullBreach,
});
roomDisplayDataList.push({
  id: 17,
  name: "Lonely Corridor",
  desc: "It's quiet, but not too quiet.",
  art: LHallway,
});
roomDisplayDataList.push({
  id: 18,
  name: "Main Reactor",
  desc: "The giant reactor hums with a strange energy.",
  art: MainReactor,
});
roomDisplayDataList.push({
  id: 19,
  name: "Medbay",
  desc: "Most of the machines are inactive, but one with a medical symbol appears to be working.\n\nUse: Return to full health +1 bonus health.",
  art: Medbay,
});
roomDisplayDataList.push({
  id: 20,
  name: "Observation Room",
  desc: "The windows flicker between clear and opaque.",
  art: Observation,
});
roomDisplayDataList.push({
  id: 21,
  name: "Officer's Bunk",
  desc: "This officer's quarters are bigger than your apartment.",
  art: OfficersBunk,
});
roomDisplayDataList.push({
  id: 22,
  name: "Pantry",
  desc: "You're not sure if the ancient can of cream of mushroom soup is comforting, or frightening.",
  art: Pantry,
});
roomDisplayDataList.push({
  id: 23,
  name: "Pump Room",
  desc: "The pumps whirr and hum.",
  art: PumpRoom,
});
roomDisplayDataList.push({
  id: 24,
  name: "Reactor Control",
  desc: "The controls shock you when you touch them.  You're not sure if that is a security feature.",
  art: ReactorControl,
});
roomDisplayDataList.push({
  id: 25,
  name: "Scavenger's Den",
  desc: "This once nice bunk room is now full of garbage and human waste.",
  art: ScavengersDen,
});
roomDisplayDataList.push({
  id: 26,
  name: "Scullery",
  desc: "An endless cycle of clean dishes are being cleaned by automated machinery.",
  art: Scullery,
});
roomDisplayDataList.push({
  id: 27,
  name: "Showers",
  desc: "It sounds like something is moving around in the drain.",
  art: Showers,
});
roomDisplayDataList.push({
  id: 28,
  name: "Torpedo Tube",
  desc: "You're afraid to think of what would happen if one of these went off.",
  art: TorpedoTube,
});
roomDisplayDataList.push({
  id: 29,
  name: "Trash Compactor",
  desc: "You think something just touched your leg!",
  art: TrashCompactor,
});
roomDisplayDataList[100] = {
  id: 100,
  name: "Main Reactor",
  desc: "Scans detect the Black Comet's main reactor at this location.",
  art: MainReactorBack,
};

export { roomDisplayDataList };
