import {
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import GamePanel, {
  BCEventType,
  DenizenType,
  EventTrackerInterface,
  GameInterface,
} from "./GamePanel";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Position } from "./Utils";

import { DoorInterface } from "./Doors";
import { ItemDataInterface } from "./ItemCard";

import Door from "./Doors";

import { PlayerInterface } from "./Player";

import Tile, {
  EmptyRoomTile,
  EmptyTile,
  GameTileInterface,
  RoomTile,
} from "./Tile";
import { BigNumber } from "ethers";
import { getEventFromId } from "./EventData";
import { Action, ActionString } from "./ActionPicker";
import ChatWindow from "./ChatWindow";

import { ethers } from "ethers";

import actionsContractDeployData from "../deployments/Actions.json";
import gamesContractDeployData from "../deployments/BCGames.json";
import playersContractDeployData from "../deployments/BCPlayers.json";
import EventTracker from "./EventTracker";
import EventModal from "./EventModal";
import GameInfoCard from "./GameInfoCard";
import { DenizenTypeToString } from "./Denizen";
import { create } from "domain";
import { roomDisplayDataList } from "./RoomTiles";

let timesBoardPulled = 0;

const DISPLAY_COLUMNS = 13; // TODO: I really need to refigure out and document the reasoning here
const ZOOMED_COLUMNS = 8;

export enum WorldItemStatus {
  UNKNOWN = 0,
  KNOWN,
  DISCARDED,
  REMOVED,
}

const EmptyEventTracker: EventTrackerInterface = {
  bugEvents: -1,
  mysteryEvents: -1,
  scavEvents: -1,
  shipEvents: -1,
};

export const EmptyGame: GameInterface = {
  active: false,
  denizenTurn: false,

  playerIndexes: [0, 0, 0, 0],
  currentPlayerTurnIndex: 0,
  numPlayers: 0,

  turnsTaken: 0,

  eventTracker: EmptyEventTracker,

  mapId: 0,

  eventPlayerId: 0,
  eventNumber: 0,
  eventType: BCEventType.NONE,
  eventPosition: { row: 0, col: 0 },

  turnTimeLimit: 0,
  lastTurnTimestamp: 0,

  denizens: [],

  gameNumber: -1,
};

export interface GameBoardProps {
  currentGameNumber: number;
  mapContract_read: any; // TODO anys
  gameContract_read: any;
  gameContract_write: any;
  charContract_read: any;
  itemContract_read: any;
  playerSignerAddress: string;
  actionsContract_write: any; // TODO: Any
  actionsContract_read: any;
  playersContract_read: any;
  playersContract_write: any;
  utilsContract_read: any;
  setCurrentGameNumber: Function;
  walletLoaded: boolean;
  provider: any; // TODO: any
}

export interface TraitsInterface {
  health: number;
  carry: number;
  defense: number;
  hack: number;
  breach: number;
  shoot: number;
  melee: number;
}

export interface CharInterface {
  genHash: string; // TODO: Tie to universal inventory
  traits: TraitsInterface;
  cloneNumber: number; // High but possibly reachable limit
  maxClones: number; // Eventually exit them from the economy??
  ability: number;
  flaw: number;
  inGame: boolean;
  dead: boolean;
  id: number;
}

export enum EffectTypes {
  empty = 0,
  permanant,
  fullHealth,
  instantDeath,
  placeHazard,
  grantEgg,
  healAmt,
  healArmorAmt,
  hazardDamage,
  physicalDamage,
  numEnemyToPlace,
  enemyType,
  whereToPlace,
  grantData,
  grantNumItems,
  takeNumItems,
  dropNumItems, // drop items in the room in unknown state
  moveType,
  trapPlayerEscapeRoll,
  grantAbility,
  loseTurn,
  lockDoorStrength,
  traitModifiersID,
}

const EffectNames = {
  0: "empty,",
  1: "permanant",
  2: "fullHealth",
  3: "instantDeath",
  4: "placeHazard",
  5: "grantEgg",
  6: "healAmt",
  7: "healArmorAmt",
  8: "hazardDamage",
  9: "physicalDamage",
  10: "numEnemyToPlace",
  11: "enemyType",
  12: "whereToPlace",
  13: "grantData",
  14: "grantNumItems",
  15: "takeNumItems",
  16: "dropNumItems,",
  17: "moveType",
  18: "trapPlayerEscapeRoll",
  19: "grantAbility",
  20: "loseTurn",
  21: "lockDoorStrength",
  22: "traitModifiersID",
};

export interface BCEffect {
  effect: EffectTypes;
  value: BigNumber;
}

export interface BCEvent {
  id: BigNumber;
  permanent: boolean;
  rollForLow: BigNumber; // Unused if zero
  rollForHigh: BigNumber; // Unused if zero
  defaultEffect: BCEffect[];
  lowEffect: BCEffect[];
  highEffect: BCEffect[];
}

interface HistoricLog {
  blockNumber: BigNumber;
  logType: string;
  log: string;
}

export default function GameBoard(props: GameBoardProps) {
  const n = 11; // TODO: Hardcoded board size, can't use await here

  // const [loading, setLoading] = useState(false);
  const [numGames, setNumGames] = useState(0);
  const [currentGame, setCurrentGame] = useState<GameInterface>(EmptyGame);
  const [roomTiles, setRoomTiles] = useState<RoomTile[]>([]);
  const [gameTiles, setGameTiles] = useState(
    Array.from({ length: n }, () => Array.from({ length: n }, () => EmptyTile))
  );
  const [doors, setDoors] = useState<DoorInterface[]>([]);
  const [players, setPlayers] = useState<PlayerInterface[]>([]);
  const [chars, setChars] = useState<CharInterface[]>([]);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [formGameNumber, setFormGameNumber] = useState(props.currentGameNumber);
  const [currentPlayerItems, setCurrentPlayerItems] = useState<any[]>(); // TODO: Any
  const [gameWorldItems, setGameWorldItems] = useState<ItemDataInterface[]>([]);
  const [roomsWithItems, setRoomsWithItem] = useState<Position[]>([]); // TODO: This should be a set

  const [lastDieRoll, setLastDieRoll] = useState("None");
  const [eventFlipper, setEventFlipper] = useState(true); // TODO: Confusing name, think this should be actionFlipper
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [eventResolved, setEventResolved] = useState(false);

  const [logs, setLogs] = useState(["Welcome to the Black Comet!"]);
  const [logBlocks, setLogBlocks] = useState<Set<BigNumber>>(new Set());

  const [dateInSeconds, setDateInSeconds] = useState(
    Math.floor(Date.now() / 1000)
  );

  const [zoomed, setZoomed] = useState(false);
  const [currentPlayerPos, setCurrentPlayerPos] = useState<Position>({
    row: -1,
    col: -1,
  });

  const [debugGameOver, setDebugGameOver] = useState(false);

  const updateWorldItemsFromChain = async () => {
    const remoteWorldItems = await props.itemContract_read.getWorldItems(
      props.currentGameNumber
    );
    // const remoteWorldItems: IWorldItem[] = [];
    const newRemoteItems: ItemDataInterface[] = [];

    const newPosWithItem: Position[] = [];

    remoteWorldItems.forEach((worldItem: ItemDataInterface) => {
      newRemoteItems.push(worldItem);
      newPosWithItem.push(worldItem.position);
    });

    setGameWorldItems([...newRemoteItems]);
    setRoomsWithItem([...newPosWithItem]);
  };

  const updateCurrentPlayerItemsFromChain = async () => {
    const playerIndexes = await props.gameContract_read.extGetGamePlayerIndexes(
      props.currentGameNumber
    );

    let playerItems: any[][] = [];
    for (let i = 0; i < playerIndexes.length; i++) {
      const currentPlayerId = playerIndexes[i];
      // TODO: Debug this.  Works fine in unit test trying to get items from null set, crashes here
      const remoteItems = await props.itemContract_read.getItemsByPlayer(
        currentPlayerId
      );

      playerItems.push(remoteItems);
    }
    setCurrentPlayerItems(playerItems);
  };

  const updateBoardFromChain = async () => {
    timesBoardPulled++;
    console.log("timesBoardPulled", timesBoardPulled);
    const remoteBoard = await props.mapContract_read.extGetBoard(
      props.currentGameNumber
    ); // TODO: Confirm that game and map numbers will always match
    const localBoard = Array.from({ length: n }, () =>
      Array.from({ length: n }, () => EmptyTile)
    );

    remoteBoard.forEach((rowData: GameTileInterface[], row: number) => {
      rowData.forEach((gameTile: GameTileInterface, col) => {
        localBoard[row][col] = gameTile;
      });
    });

    const remoteRoomTiles = await props.mapContract_read.extGetRoomList(
      props.currentGameNumber
    ); // TODO: Confirm that game and map numbers will always match
    const localRoomTiles: RoomTile[] = [];

    remoteRoomTiles.forEach((roomTile: RoomTile) => {
      localRoomTiles.push(roomTile);
    });

    // TODO: Hack for broken reactor.  Remove next time you see this!
    // I saw it 4-23 and I don't remember what it does and am not sure if I should remove
    // removed 7-15
    // localRoomTiles[100] = EmptyRoomTile;

    setGameTiles(localBoard);
    setRoomTiles(localRoomTiles);
  };

  const updateCharsFromChain = async () => {
    const updatedChars: CharInterface[] = [];
    // TODO: Get the cached char id list instead of loading it
    const playerIndexes = await props.gameContract_read.extGetGamePlayerIndexes(
      props.currentGameNumber
    );

    for (let i = 0; i < playerIndexes.length; i++) {
      const remotePlayer = await props.playersContract_read.players(
        playerIndexes[i]
      );
      const remoteChar = await props.charContract_read.characters(
        remotePlayer.characterId
      );
      updatedChars.push(remoteChar);
    }

    setChars(updatedChars);
  };

  const updateDoorsFromChain = async () => {
    const remoteDoors = await props.mapContract_read.extGetDoors(
      props.currentGameNumber
    ); // TODO: Get game first and get board number from it

    const newDoors: DoorInterface[] = [];

    remoteDoors.forEach((door: DoorInterface, index: number) => {
      const newDoor: DoorInterface = {
        vsBreach: door.vsBreach,
        vsHack: door.vsHack,
        status: door.status,
        rotate: false,
      };
      // newDoors[index] = newDoor;
      newDoors.push(newDoor);
    });

    setDoors(newDoors);
  };

  const updateRemotePlayers = async () => {
    const newPlayers: PlayerInterface[] = [];

    const playerIndexes = await props.gameContract_read.extGetGamePlayerIndexes(
      props.currentGameNumber
    );

    for (let i = 0; i < playerIndexes.length; i++) {
      const remotePlayer = await props.playersContract_read.players(
        playerIndexes[i]
      );
      const { position } = remotePlayer;
      const newPlayer: PlayerInterface = {
        remoteId: playerIndexes[i],

        owner: remotePlayer.owner,
        characterId: remotePlayer.characterId,

        currentTraits: remotePlayer.currentTraits,

        position: position,

        healthDmgTaken: remotePlayer.healthDmgTaken,
        armorDmgTaken: remotePlayer.armorDmgTaken,
        actionsTaken: remotePlayer.actionsTaken,

        dataTokens: remotePlayer.dataTokens,
        currentEffects: remotePlayer.currentEffects,
        inventoryIDs: remotePlayer.inventoryIDs,

        canHarmOthers: remotePlayer.canHarmOthers,
        dead: remotePlayer.dead,
      };
      newPlayers.push(newPlayer);
    }
    setPlayers(newPlayers);
  };

  // TODO: Decompose this to a component
  const getLogBlocks = async () => {
    const historicLogs: HistoricLog[] = [];

    const actionsBlocks = await props.actionsContract_read.getEventBlocks(
      props.currentGameNumber
    );

    // DON'T SORT NOW, WILL SORT AFTER WE HAVE THEM ALL
    // Then create filters for the DiceRollEvent, ChallengeEvent, and ActionCompleteEvent in the actions contract
    // console.log("actionsBlocks", actionsBlocks);
    const actionsInterface = new ethers.utils.Interface(
      actionsContractDeployData.abi
    );

    // TODO: It's probably not efficient to make all these filters more than once
    const actionsDiceRollEventFilter =
      await props.actionsContract_read.filters.DiceRollEvent();

    const actionsChallengeEventFilter =
      await props.actionsContract_read.filters.ChallengeEvent();

    const actionCompleteEventFilter =
      await props.actionsContract_read.filters.ActionCompleteEvent();

    for (const blockNumber of actionsBlocks) {
      const diceRollEvents = await props.actionsContract_read.queryFilter(
        actionsDiceRollEventFilter,
        blockNumber.toNumber(),
        blockNumber.toNumber()
      );

      for (const diceRollEvent of diceRollEvents) {
        const parsedEvent = actionsInterface.parseLog(diceRollEvent);
        // console.log("parsedEvent", parsedEvent);
        if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
          const newLog = buildDiceRollEventLog(parsedEvent.args.roll);

          historicLogs.push({
            blockNumber,
            logType: "DiceRollEvent",
            log: newLog,
          });
        }
      }

      const challengeEvents = await props.actionsContract_read.queryFilter(
        actionsChallengeEventFilter,
        blockNumber.toNumber(),
        blockNumber.toNumber()
      );

      for (const challengeEvent of challengeEvents) {
        const parsedEvent = actionsInterface.parseLog(challengeEvent);
        // console.log("parsedEvent", parsedEvent);
        if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
          const newLog =
            "Challenge roll of: " +
            parsedEvent.args.roll.toString() +
            ". For: " +
            parsedEvent.args.forValue.toString() +
            " Against: " +
            parsedEvent.args.against.toString();

          historicLogs.push({
            blockNumber,
            logType: "ChallengeEvent",
            log: newLog,
          });
        }
      }

      const actionCompleteEvents = await props.actionsContract_read.queryFilter(
        actionCompleteEventFilter,
        blockNumber.toNumber(),
        blockNumber.toNumber()
      );

      for (const actionCompleteEvent of actionCompleteEvents) {
        const parsedEvent = actionsInterface.parseLog(actionCompleteEvent);
        // console.log("parsedActionCompleteEvent", parsedEvent);
        if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
          const { position } = parsedEvent.args.player;
          const newLog =
            "Player " +
            parsedEvent.args.playerId.toString() +
            " selected " +
            ActionString[parsedEvent.args.action as Action] +
            " at " +
            position.row.toString() +
            ", " +
            position.col.toString();

          historicLogs.push({
            blockNumber,
            logType: "ActionCompleteEvent",
            log: newLog,
          });
        }
      }
    }

    const gamesBlocks = await props.gameContract_read.getEventBlocks(
      props.currentGameNumber
    );

    const gamesInterface = new ethers.utils.Interface(
      gamesContractDeployData.abi
    );

    const gamesDiceRollEventFilter =
      await props.gameContract_read.filters.DiceRollEvent();

    const gamesChallengeEventFilter =
      await props.gameContract_read.filters.ChallengeEvent();

    const denizenAttackEventFilter =
      await props.gameContract_read.filters.DenizenAttack();

    const playerAttackEventFilter =
      await props.gameContract_read.filters.PlayerAttack();

    const playerDiceRollEventFilter =
      await props.playersContract_read.filters.DiceRollEvent();

    const playerDiedEventFilter =
      await props.playersContract_read.filters.PlayerDiedEvent();

    const denizenTurnOverFilter =
      await props.gameContract_read.filters.DenizenTurnOver();

    for (const blockNumber of gamesBlocks) {
      const diceRollEvents = await props.gameContract_read.queryFilter(
        gamesDiceRollEventFilter,
        blockNumber.toNumber(),
        blockNumber.toNumber()
      );

      for (const diceRollEvent of diceRollEvents) {
        const parsedEvent = gamesInterface.parseLog(diceRollEvent);
        // console.log("parsedEvent", parsedEvent);
        if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
          const newLog = buildDiceRollEventLog(parsedEvent.args.roll);

          historicLogs.push({
            blockNumber,
            logType: "DiceRollEvent",
            log: newLog,
          });
        }
      }

      const challengeEvents = await props.gameContract_read.queryFilter(
        gamesChallengeEventFilter,
        blockNumber.toNumber(),
        blockNumber.toNumber()
      );

      for (const challengeEvent of challengeEvents) {
        const parsedEvent = gamesInterface.parseLog(challengeEvent);
        // console.log("parsedEvent", parsedEvent);
        if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
          const newLog =
            "Challenge roll of: " +
            parsedEvent.args.roll.toString() +
            ". For: " +
            parsedEvent.args.forValue.toString() +
            " Against: " +
            parsedEvent.args.against.toString();

          historicLogs.push({
            blockNumber,
            logType: "ChallengeEvent",
            log: newLog,
          });
        }
      }

      const denizenAttackEvents = await props.gameContract_read.queryFilter(
        denizenAttackEventFilter,
        blockNumber.toNumber(),
        blockNumber.toNumber()
      );

      for (const denizenAttackEvent of denizenAttackEvents) {
        const parsedEvent = gamesInterface.parseLog(denizenAttackEvent);
        // console.log("parsedEvent", parsedEvent);
        if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
          const newLog =
            DenizenTypeToString.get(parsedEvent.args.denizenType) +
            " with ID " +
            parsedEvent.args.denizenId.toString() +
            " attacked player " +
            parsedEvent.args.playerTarget.toString() +
            " for " +
            parsedEvent.args.damage.toString() +
            " and took turnabout of " +
            parsedEvent.args.turnabout.toString();

          historicLogs.push({
            blockNumber,
            logType: "DenizenAttack",
            log: newLog,
          });
        }
      }

      const playerAttackEvents = await props.gameContract_read.queryFilter(
        playerAttackEventFilter,
        blockNumber.toNumber(),
        blockNumber.toNumber()
      );

      for (const playerAttackEvent of playerAttackEvents) {
        const parsedEvent = gamesInterface.parseLog(playerAttackEvent);
        // console.log("parsedEvent", parsedEvent);
        if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
          const newLog =
            "Player with ID " +
            parsedEvent.args.playerId.toString() +
            " attacked " +
            DenizenTypeToString.get(parsedEvent.args.denizenType) +
            " #" +
            parsedEvent.args.denizenId.toString() +
            " for " +
            parsedEvent.args.damage.toString() +
            " and took turnabout of " +
            parsedEvent.args.turnabout.toString();

          historicLogs.push({
            blockNumber,
            logType: "PlayerAttack",
            log: newLog,
          });
        }
      }

      const denizenTurnOverEvents = await props.gameContract_read.queryFilter(
        denizenTurnOverFilter,
        blockNumber.toNumber(),
        blockNumber.toNumber()
      );

      for (const denizenTurnOverEvent of denizenTurnOverEvents) {
        const parsedEvent = gamesInterface.parseLog(denizenTurnOverEvent);
        // console.log("parsedEvent", parsedEvent);
        if (parsedEvent.args.gameId.toNumber() === props.currentGameNumber) {
          const newLog = "Denizen Turn Over";

          historicLogs.push({
            blockNumber,
            logType: "DenizenTurnOver",
            log: newLog,
          });
        }
      }
    }

    const playersBlocks = await props.playersContract_read.getEventBlocks(
      props.currentGameNumber
    );

    const playersInterface = new ethers.utils.Interface(
      playersContractDeployData.abi
    );

    const eventResolvedEventFilter =
      await props.playersContract_read.filters.EventResolvedEvent();

    for (const blockNumber of playersBlocks) {
      const eventResolvedEvents = await props.playersContract_read.queryFilter(
        eventResolvedEventFilter,
        blockNumber.toNumber(),
        blockNumber.toNumber()
      );

      for (const eventResolvedEvent of eventResolvedEvents) {
        const parsedEvent = playersInterface.parseLog(eventResolvedEvent);
        // console.log("parsedEvent", parsedEvent);
        if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
          const newLog = buildBCEventEventLog(
            parsedEvent.args.bcEvent,
            parsedEvent.args.position
          );

          const newLog2 = createEffectLog(parsedEvent.args.appliedBCEffects);

          historicLogs.push({
            blockNumber,
            logType: "EventResolvedEvent1",
            log: newLog,
          });

          historicLogs.push({
            blockNumber,
            logType: "EventResolvedEvent2",
            log: newLog2,
          });
        }
      }

      const playerDiceRollEvents = await props.playersContract_read.queryFilter(
        playerDiceRollEventFilter,
        blockNumber.toNumber(),
        blockNumber.toNumber()
      );

      for (const playerDiceRollEvent of playerDiceRollEvents) {
        const parsedEvent = playersInterface.parseLog(playerDiceRollEvent);
        // console.log("parsedEvent", parsedEvent);
        if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
          const newLog = buildDiceRollEventLog(parsedEvent.args.roll);

          historicLogs.push({
            blockNumber,
            logType: "EventDiceRollEvent",
            log: newLog,
          });
        }
      }

      const playerDiedEvents = await props.playersContract_read.queryFilter(
        playerDiedEventFilter,
        blockNumber.toNumber(),
        blockNumber.toNumber()
      );

      for (const playerDiedEvent of playerDiedEvents) {
        const parsedEvent = playersInterface.parseLog(playerDiedEvent);
        // console.log("parsedEvent", parsedEvent);
        if (parsedEvent.args.gameId.toNumber() === props.currentGameNumber) {
          const newLog =
            "Player " +
            parsedEvent.args.playerId.toString() +
            " died at " +
            parsedEvent.args.position.row.toString() +
            ", " +
            parsedEvent.args.position.col.toString() +
            " from " +
            parsedEvent.args.damage.toString() +
            " damage";

          historicLogs.push({
            blockNumber,
            logType: "PlayerDiedEvent",
            log: newLog,
          });
        }
      }
    }

    // TODO: After events are added to items contract
    // const itemsBlocks = await props.itemContract_read.getEventBlocks(
    //   props.currentGameNumber
    // );
    const sortedHistoricLogs = sortHistoricLogs(historicLogs);
    const newLogs = mapHistoricLogsToLogs(sortedHistoricLogs);
    setLogs([...newLogs]);
  };

  const loadGameBoard = async () => {
    if (eventFlipper === true) {
      setNumGames(await props.gameContract_read.extGetNumGames());
      console.log("Loading game number from event:", props.currentGameNumber);
      const remoteGame = await props.gameContract_read.games(
        props.currentGameNumber
      );
      setCurrentGame(remoteGame);

      console.log("updating doors, board, players from chain");

      await updateDoorsFromChain();
      await updateBoardFromChain();
      await updateRemotePlayers();
      await updateCurrentPlayerItemsFromChain();

      await updateCharsFromChain();
      await updateWorldItemsFromChain();

      setEventFlipper(false);
    }

    if (gameLoaded === false) {
      setNumGames(await props.gameContract_read.extGetNumGames());
      console.log("Loading game number from start:", props.currentGameNumber);
      const remoteGame = await props.gameContract_read.games(
        props.currentGameNumber
      );
      setCurrentGame(remoteGame);
      if (remoteGame.active) {
        await updateDoorsFromChain();
        await updateBoardFromChain();
        await updateRemotePlayers();
        await updateCurrentPlayerItemsFromChain();
        await updateCharsFromChain();
        await getLogBlocks();
        setGameLoaded(true);
      } else {
        setDebugGameOver(true);
      }
    }
  };

  // function refreshClock() {
  //   setDateInSeconds(Math.floor(Date.now() / 1000));
  // }

  // useEffect(() => {
  //   const timerId = setInterval(refreshClock, 1000);
  //   return function cleanup() {
  //     clearInterval(timerId);
  //   };
  // }, [dateInSeconds]);

  useEffect(() => {
    console.log("Start of useEffect in Board");

    loadGameBoard().then(async () => {
      if (currentGame.numPlayers > 0) {
        setCurrentPlayerPos({
          row: players[currentGame.currentPlayerTurnIndex].position.row,
          col: players[currentGame.currentPlayerTurnIndex].position.col,
        });
      }
      const denizens = await props.gameContract_read.getDenizensInGame(
        props.currentGameNumber
      );
      let newGame = { ...currentGame };
      newGame.denizens = denizens;
      setCurrentGame(newGame);
    });
    if (props.walletLoaded && !eventsLoaded) {
      // TODO: Find appropriate home
      // WARNING:  This is creating a stale closure, but it's not impacted because the listener is destroyed and recreated when the game changes
      // TODO: This is here because if it's in App, for some reason, events cause the tab content to unmount and remount, completely reloading Board

      props.gameContract_read.on(
        "DiceRollEvent",
        (gameId: BigNumber, roll: BigNumber) => {
          // TODO: Hack using mapID instead of gameId
          // DO NOT USE ===, will always be false!!
          if (gameId.toNumber() === props.currentGameNumber) {
            setLastDieRoll(roll.toString());
            const newLog = buildDiceRollEventLog(roll);
            setLogs([...logs, newLog]);
          }
        }
      );

      props.playersContract_read.on(
        "DiceRollEvent",
        (gameId: BigNumber, roll: BigNumber) => {
          // TODO: Hack using mapID instead of gameId
          // DO NOT USE ===, will always be false!!
          if (gameId.toNumber() === props.currentGameNumber) {
            setLastDieRoll(roll.toString());
            const newLog = buildDiceRollEventLog(roll);
            setLogs([...logs, newLog]);
          }
        }
      );

      props.playersContract_read.on(
        "PlayerDiedEvent",
        (
          gameId: BigNumber,
          playerId: BigNumber,
          damage: BigNumber,
          position: Position
        ) => {
          if (gameId.toNumber() == props.currentGameNumber) {
            const newLog =
              "Player " +
              playerId.toString() +
              " died at " +
              position.row.toString() +
              ", " +
              position.col.toString() +
              " from " +
              damage.toString() +
              " damage";
            setLogs([...logs, newLog]);
            setEventFlipper(true);
          }
        }
      );

      props.gameContract_read.on(
        "ChallengeEvent",
        (
          gameId: BigNumber,
          roll: BigNumber,
          forValue: BigNumber,
          against: BigNumber
        ) => {
          // TODO: Hack using mapID instead of gameId
          // TODO: THe above might not be true an longer
          if (gameId.toNumber() === props.currentGameNumber) {
            setLastDieRoll(roll.toString());
            const newLog =
              "A challenge roll was " +
              roll.toString() +
              ". For: " +
              forValue.toString() +
              " Against: " +
              against.toString();
            setLogs([...logs, newLog]);
          }
        }
      );

      props.actionsContract_read.on(
        "DiceRollEvent",
        (gameId: BigNumber, roll: BigNumber) => {
          // TODO: Hack using mapID instead of gameId
          // DO NOT USE ===, will always be false!!
          if (gameId.toNumber() === props.currentGameNumber) {
            setLastDieRoll(roll.toString());
            const newLog = buildDiceRollEventLog(roll);
            setLogs([...logs, newLog]);
          }
        }
      );

      props.actionsContract_read.on(
        "ChallengeEvent",
        (
          gameId: BigNumber,
          roll: BigNumber,
          forValue: BigNumber,
          against: BigNumber
        ) => {
          // TODO: Hack using mapID instead of gameId
          // TODO: THe above might not be true an longer
          if (gameId.toNumber() === props.currentGameNumber) {
            setLastDieRoll(roll.toString());
            const newLog =
              "A challenge roll was " +
              roll.toString() +
              ". For: " +
              forValue.toString() +
              " Against: " +
              against.toString();
            setLogs([...logs, newLog]);
          }
        }
      );

      props.gameContract_read.on(
        "DenizenAttack",
        (
          gameId: BigNumber,
          denizenType: DenizenType,
          denizenId: BigNumber,
          playerTarget: BigNumber,
          damage: BigNumber,
          turnabout: BigNumber
        ) => {
          if (gameId.toNumber() === props.currentGameNumber) {
            const newLog =
              denizenType.toString() +
              " with ID " +
              denizenId.toString() +
              " attacked player " +
              playerTarget.toString() +
              " for " +
              damage.toString() +
              " and took turnabout of " +
              turnabout.toString();
            setLogs([...logs, newLog]);
          }
        }
      );

      props.actionsContract_read.on(
        "ActionCompleteEvent",
        (
          gameId: BigNumber,
          // game: GameInterface,
          playerId: BigNumber,
          player: PlayerInterface,
          action: Action
        ) => {
          if (gameId.toNumber() === props.currentGameNumber) {
            const { position } = player;
            const newLog =
              "Player " +
              playerId.toString() +
              " selected " +
              ActionString[action] +
              " at " +
              position.row.toString() +
              ", " +
              position.col.toString();
            setLogs([...logs, newLog]);

            setEventFlipper(true);
          }
        }
      );

      props.gameContract_read.on(
        "PlayerAttack",
        (
          gameId: BigNumber,
          playerId: BigNumber,
          denizenType: DenizenType,
          denizenId: BigNumber,
          damage: BigNumber,
          turnabout: BigNumber
        ) => {
          const newLog =
            "Player with ID " +
            playerId.toString() +
            " attacked " +
            denizenType.toString() +
            " #" +
            denizenId.toString() +
            " for " +
            damage.toString() +
            " and took turnabout of " +
            turnabout.toString();
          setLogs([...logs, newLog]);
        }
      );

      props.gameContract_read.on("DenizenTurnOver", (gameId: BigNumber) => {
        if (gameId.toNumber() === props.currentGameNumber) {
          const newLog = "Denizen Turn Over";
          setLogs([...logs, newLog]);
          setEventFlipper(true);
        }
      });

      props.playersContract_read.on(
        "EventResolvedEvent",
        (
          gameId: BigNumber,
          playerId: BigNumber,
          bcEvent: BCEvent,
          bcEffects: BCEffect[], // The effect that actually happened
          position: Position
        ) => {
          // DO NOT USE ===, will always be false!!
          if (gameId.toNumber() == props.currentGameNumber) {
            setEventResolved(true);

            const newLog = buildBCEventEventLog(bcEvent, position);
            const newLog2 = createEffectLog(bcEffects);

            setLogs([...logs, newLog, newLog2]);

            setEventsLoaded(true);
            setEventFlipper(true);
          }
        }
      );
    }
  }, [gameLoaded, props.currentGameNumber, eventFlipper, props.walletLoaded]);

  function buildDiceRollEventLog(roll: BigNumber) {
    const newLog = "A " + roll.toString() + " was rolled.";
    return newLog;
  }

  function buildBCEventEventLog(bcEvent: BCEvent, position: Position) {
    const { id } = bcEvent;
    const eventData = getEventFromId(id);
    const name = eventData[0].name;
    const newLog =
      "Player experienced " +
      name +
      " in " +
      roomDisplayDataList[gameTiles[position.row][position.col].roomId].name +
      " at " +
      position.row +
      ", " +
      position.col +
      ".";

    return newLog;
  }

  function createEffectLog(effects: BCEffect[]) {
    const effectNames = effects.map((effect: BCEffect) => {
      return EffectNames[effect.effect] + ", ";
    });

    let newLog;

    if (effectNames.length === 0) {
      return "This event is not yet implemented";
    }

    if (effectNames[0] === "numEnemyToPlace, ") {
      newLog =
        effects[0].value +
        " " +
        DenizenTypeToString.get(
          ethers.BigNumber.from(effects[1].value).toNumber()
        ) +
        " were placed"; // TODO: Add where
    } else {
      newLog = "The effects were " + effectNames.join("").slice(0, -2);
    }

    return newLog;
  }

  function sortHistoricLogs(historicLogs: HistoricLog[]) {
    const logTypeOrder = [
      "ActionCompleteEvent",
      "EventResolvedEvent1",
      "EventDiceRollEvent",
      "EventResolvedEvent2",
      "PlayerAttack",
      "DenizenAttack",
      "DiceRollEvent",
      "ChallengeEvent",
      "PlayerDiedEvent",
      "DenizenTurnOver",
    ];

    return historicLogs.sort((a, b) => {
      if (a.blockNumber.lt(b.blockNumber)) return -1; // assuming BigNumber has lt method for less than comparison
      if (a.blockNumber.gt(b.blockNumber)) return 1; // assuming BigNumber has gt method for greater than comparison

      // blockNumbers are equal, sort by logType
      return logTypeOrder.indexOf(a.logType) - logTypeOrder.indexOf(b.logType);
    });
  }

  function mapHistoricLogsToLogs(historicLogs: HistoricLog[]): string[] {
    return historicLogs.map((log) => log.log);
  }

  function renderRowWithDoors(row: number) {
    const rowWithDoors: ReactNode[] = [];
    // gameTiles[row].forEach((tile: GameTileInterface, col) => {
    for (let col = getZoomedColStart(); col < getZoomedColEnd(); col++) {
      const tile = gameTiles[row][col];
      if (col === 0 || col === n - 1) {
        return;
      }
      const itemKey = row + "," + col;
      rowWithDoors.push(
        <Grid item xs={1} key={itemKey}>
          <Tile
            tile={tile}
            players={players}
            chars={chars}
            row={row}
            col={col}
            currentGame={currentGame}
            roomTiles={roomTiles}
            roomsWithItems={roomsWithItems}
          />
        </Grid>
      );
      // Don't render the last door.  -2 because other process skips outer ring
      if (col < n - 2) {
        rowWithDoors.push(
          <Door
            vsBreach={doors[tile.doors[2]].vsBreach}
            vsHack={doors[tile.doors[2]].vsHack}
            status={doors[tile.doors[2]].status}
            rotate={true}
            key={itemKey + "-door-id-" + tile.doors[2]}
          />
        );
      }
    }
    return rowWithDoors;
  }

  // Render N/S doors based on the south door of each tile
  function renderRowOfDoors(row: number) {
    const rowOfDoors: ReactNode[] = [];
    // Start with a small, empty item to offset doors for alignment
    rowOfDoors.push(
      <Grid item xs={0.25} key={row + "-starter"}>
        <Card></Card>
      </Grid>
    );
    // gameTiles[row].forEach((tile: GameTileInterface, col) => {
    // if (col === 0 || col === n - 1) {
    //   return;
    // }
    for (let col = getZoomedColStart(); col < getZoomedColEnd(); col++) {
      const tile = gameTiles[row][col];
      const itemKey = row + "," + col;
      rowOfDoors.push(
        <Door
          vsBreach={doors[tile.doors[1]].vsBreach}
          vsHack={doors[tile.doors[1]].vsHack}
          status={doors[tile.doors[1]].status}
          rotate={false}
          key={itemKey + "-door-id-" + tile.doors[1]}
        />
      );

      // Push an "empty" card to maintain grid, except the last
      if (col < n - 1) {
        rowOfDoors.push(
          <Grid item xs={1} key={row + "," + col + "-empty"}>
            <Card></Card>
          </Grid>
        );
      }
    }

    return rowOfDoors;
  }

  function getZoomedRowStart() {
    if (zoomed) {
      if (currentPlayerPos.row <= 3) {
        return 1;
      } else if (currentPlayerPos.row >= 8) {
        return 6;
      } else {
        return currentPlayerPos.row - 2;
      }
    } else {
      return 1;
    }
  }

  function getZoomedRowEnd() {
    if (zoomed) {
      if (currentPlayerPos.row <= 3) {
        return 5;
      } else if (currentPlayerPos.row >= 8) {
        return 11;
      } else {
        return currentPlayerPos.row + 3; // + 2 for desired rows and 1 for < in other loop
      }
    } else {
      return n; // Not n-1 to render Donghaijiu
    }
  }

  function getZoomedColStart() {
    if (zoomed) {
      if (currentPlayerPos.col <= 3) {
        return 1;
      } else if (currentPlayerPos.col >= 8) {
        return 6;
      } else {
        return currentPlayerPos.col - 2;
      }
    } else {
      return 1;
    }
  }

  function getZoomedColEnd() {
    if (zoomed) {
      if (currentPlayerPos.col <= 3) {
        return 5;
      } else if (currentPlayerPos.col >= 8) {
        return 11;
      } else {
        return currentPlayerPos.col + 3;
      }
    } else {
      return n - 1;
    }
  }

  function renderMapWithDoors() {
    const rows: ReactNode[] = [];
    // gameTiles.forEach((rowData: GameTileInterface[], row) => {
    for (let row = getZoomedRowStart(); row < getZoomedRowEnd(); row++) {
      const rowData = gameTiles[row];
      if (row === 0) {
        return;
      }
      if (row < n - 1) {
        rows.push(
          <Box key={row + "-withDoors"}>
            <Grid
              container
              spacing={0}
              columns={zoomed ? ZOOMED_COLUMNS : DISPLAY_COLUMNS}
            >
              {renderRowWithDoors(row)}
            </Grid>
            <Grid
              container
              spacing={0}
              columns={zoomed ? ZOOMED_COLUMNS : DISPLAY_COLUMNS}
            >
              {renderRowOfDoors(row)}
            </Grid>
          </Box>
        );
      } else {
        // Don't print a row of doors at the bottom
        rows.push(
          <Box key={row + "-withDoors"}>
            <Grid
              container
              spacing={0}
              columns={zoomed ? ZOOMED_COLUMNS : DISPLAY_COLUMNS}
            >
              {renderRowWithDoors(row)}
            </Grid>
          </Box>
        );
      }
    }
    return rows;
  }

  function renderMapArea() {
    // if (numGames === 0) {
    //   return (
    //     <Box>No games yet!</Box>
    //   )
    // }

    if (props.currentGameNumber > numGames) {
      return <Box>Selected game does not exist!</Box>;
    }

    return !gameLoaded ? (
      "Loading..."
    ) : (
      <Card>
        <CardContent>
          <Box sx={{ flexGrow: 1 }}>{renderMapWithDoors()}</Box>
        </CardContent>
      </Card>
    );
  }

  function getNumItems() {
    const currentPlayer = players[currentGame.currentPlayerTurnIndex];
    const currentRoomId =
      gameTiles[currentPlayer.position.row][currentPlayer.position.col].roomId;
    // console.log("there are this many items:", roomTiles[currentRoomId].numItems)
    // console.log(typeof(roomTiles[currentRoomId].numItems))

    return roomTiles[currentRoomId].numItems;
  }

  useEffect(() => {
    setGameLoaded(false);
    localStorage.setItem("lastGame", props.currentGameNumber.toString());
  }, [props.currentGameNumber]);

  function handleGameSelectorChange(event: SelectChangeEvent) {
    const gameNum = event.target.value;
    // setGameLoaded(false); Happens above now
    // localStorage.setItem("lastGame", gameNum.toString());
    props.setCurrentGameNumber(gameNum);
  }

  function buildGamesDropDown() {
    const menuItems: ReactNode[] = [];
    for (let i = 0; i < numGames; i++) {
      menuItems.push(
        <MenuItem key={"games-dd-" + i} value={i}>
          {i}
        </MenuItem>
      );
    }
    return menuItems;
  }

  // TODO: Rewrite all of this
  function getSecondsRemaining() {
    // TODO: Figure out this insanity.  Why are they behaving as strings when added, type of object, but think they're numbers, when they're bigNumbers?
    const endOfTurnSeconds: number =
      parseInt(currentGame.lastTurnTimestamp.toString()) +
      parseInt(currentGame.turnTimeLimit.toString());
    return dateInSeconds - endOfTurnSeconds;
  }

  function getTurnTimeRemaining() {
    const remaining = getSecondsRemaining();

    const negative = remaining <= 0 ? "" : "-";
    return negative + fancyTimeFormat(Math.abs(remaining)); // TODO: Minutes and seconds
  }

  function fancyTimeFormat(duration: number) {
    // Hours, minutes and seconds
    const hrs = ~~(duration / 3600);
    const mins = ~~((duration % 3600) / 60);
    const secs = ~~duration % 60;

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = "";

    if (hrs > 0) {
      ret += "" + hrs + ":" + (mins < 10 ? "0" : "");
    }

    ret += "" + mins + ":" + (secs < 10 ? "0" : "");
    ret += "" + secs;

    return ret;
  }

  function getTimeColor() {
    const secondsRemaining = -getSecondsRemaining();

    if (secondsRemaining < 0) {
      return "red";
    } else if (secondsRemaining < 60) {
      return "yellow";
    } else {
      return "white";
    }
  }

  function handleEndTurnClick() {
    props.gameContract_write.forceNextTurn(props.currentGameNumber);
    setEventFlipper(true);
  }

  function handleDenizenTurnClick() {
    props.gameContract_write.processDenizenMoves(props.currentGameNumber, {
      gasLimit: 10_000_000,
    });
    setEventFlipper(true);
  }

  function renderGameArea() {
    if (debugGameOver) {
      return "Game is over.  Will add seeing old games later";
    }
    return !gameLoaded ? (
      "Loading Game Area..."
    ) : (
      <Box>
        <Grid container spacing={0} columns={DISPLAY_COLUMNS}>
          <Grid item xs={3}>
            <Card>
              <Grid container>
                <Grid item xs={3}>
                  <Typography variant="body1" align="left" color={getTimeColor}>
                    {/* {"Time Left: " + getTurnTimeRemaining()} */}
                    {"Time Left: ???"}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  <Box alignContent="right">
                    <Button
                      disabled={
                        getTurnTimeRemaining()[0] === "-" ? false : true
                      }
                      onClick={handleEndTurnClick}
                    >
                      Skip Player
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box alignContent="right">
                    <Button
                      disabled={!currentGame.denizenTurn}
                      onClick={handleDenizenTurnClick}
                    >
                      Denizen Turn
                    </Button>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box alignContent="right">
                    <Button
                      onClick={() => {
                        setZoomed(!zoomed);
                      }}
                    >
                      {zoomed ? "Zoom Out" : "Zoom In"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              <GamePanel
                currentPlayer={players[currentGame.currentPlayerTurnIndex]}
                currentChar={chars[currentGame.currentPlayerTurnIndex]}
                currentGameProps={currentGame}
                currentGameNumber={props.currentGameNumber}
                playerSignerAddress={props.playerSignerAddress}
                actionsContract_write={props.actionsContract_write}
                gameContract_write={props.gameContract_write}
                lastDieRoll={lastDieRoll}
                setLastDieRoll={setLastDieRoll}
                numItems={getNumItems()}
                allHeldItems={currentPlayerItems}
                roomTiles={roomTiles}
                players={players}
                chars={chars}
                currentTile={
                  gameTiles[
                    players[currentGame.currentPlayerTurnIndex].position.row
                  ][players[currentGame.currentPlayerTurnIndex].position.col]
                }
                setEventFlipper={setEventFlipper}
                eventResolved={eventResolved}
                setEventResolved={setEventResolved}
                roomsWithItems={roomsWithItems}
                gameWorldItems={gameWorldItems}
                logs={logs}
              />
            </Card>
          </Grid>
          <Grid item xs={9}>
            <Grid container spacing={0}>
              <Grid item xs={6}>
                <EventTracker currentGameProps={currentGame} />
              </Grid>
              <Grid item xs={3}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <EventModal
                      currentPlayer={
                        players[currentGame.currentPlayerTurnIndex]
                      }
                      currentChar={chars[currentGame.currentPlayerTurnIndex]}
                      currentGameProps={currentGame}
                      currentGameNumber={props.currentGameNumber}
                      playerSignerAddress={props.playerSignerAddress}
                      actionsContract_write={props.actionsContract_write}
                      gameContract_write={props.gameContract_write}
                      lastDieRoll={lastDieRoll}
                      setLastDieRoll={setLastDieRoll}
                      numItems={getNumItems()}
                      allHeldItems={currentPlayerItems}
                      roomTiles={roomTiles}
                      players={players}
                      chars={chars}
                      currentTile={
                        gameTiles[
                          players[currentGame.currentPlayerTurnIndex].position
                            .row
                        ][
                          players[currentGame.currentPlayerTurnIndex].position
                            .col
                        ]
                      }
                      setEventFlipper={setEventFlipper}
                      eventResolved={eventResolved}
                      setEventResolved={setEventResolved}
                      roomsWithItems={roomsWithItems}
                      gameWorldItems={gameWorldItems}
                      logs={logs}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box>
                      <FormControl fullWidth>
                        <InputLabel id="game-selector-label">
                          Change Game
                        </InputLabel>
                        <Select
                          labelId="game-selector-dd-label"
                          id="game-selector-dd"
                          value={props.currentGameNumber.toString()}
                          onChange={handleGameSelectorChange}
                        >
                          {buildGamesDropDown()}
                        </Select>
                      </FormControl>
                    </Box>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={3}>
                <GameInfoCard
                  currentPlayer={players[currentGame.currentPlayerTurnIndex]}
                  currentChar={chars[currentGame.currentPlayerTurnIndex]}
                  currentGameProps={currentGame}
                  currentGameNumber={props.currentGameNumber}
                  playerSignerAddress={props.playerSignerAddress}
                  actionsContract_write={props.actionsContract_write}
                  gameContract_write={props.gameContract_write}
                  lastDieRoll={lastDieRoll}
                  setLastDieRoll={setLastDieRoll}
                  numItems={getNumItems()}
                  allHeldItems={currentPlayerItems}
                  roomTiles={roomTiles}
                  players={players}
                  chars={chars}
                  currentTile={
                    gameTiles[
                      players[currentGame.currentPlayerTurnIndex].position.row
                    ][players[currentGame.currentPlayerTurnIndex].position.col]
                  }
                  setEventFlipper={setEventFlipper}
                  eventResolved={eventResolved}
                  setEventResolved={setEventResolved}
                  roomsWithItems={roomsWithItems}
                  gameWorldItems={gameWorldItems}
                  logs={logs}
                />
              </Grid>
              <Grid item xs={12}>
                {renderMapArea()}
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Box>
    );
  }
  // ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] used to debug ChatWindow below
  return (
    <Box>
      {renderGameArea()}
      <ChatWindow content={[...logs]} />
    </Box>
  );
}
