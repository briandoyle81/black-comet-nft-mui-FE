import { usePublicClient } from "wagmi";
import {
  actionsContract,
  denizensContract,
  gamesContract,
  playersContract,
} from "../contracts/index"; // TODO: Why does this complain all the sudden if I don't have index in the path?
import { useEffect, useState } from "react";
import {
  BCEffect,
  BCEvent,
  CompleteGame,
  EffectNames,
  HistoricLog,
} from "./Board";
import { getAbiItem } from "viem";
import { Position } from "../utils/Utils";
import { roomDisplayDataList } from "./RoomTiles";
import { getEventFromId } from "./EventData";
import { DenizenTypeToString } from "./Denizen";
import { Action, ActionString } from "./ActionPicker";

export interface GameLogProps {
  currentGameNumber: number;
  completeGame: CompleteGame;
  setLogs: Function;
}

export default function GameLogs(props: GameLogProps) {
  const publicClient = usePublicClient();

  const [historicLogs, setHistoricLogs] = useState<HistoricLog[]>([]);

  const [actionsLogBlocks, setActionsLogBlocks] = useState<Set<bigint>>(
    new Set()
  );
  const [gamesLogBlocks, setGamesLogBlocks] = useState<Set<bigint>>(new Set());
  const [playersLogBlocks, setPlayersLogBlocks] = useState<Set<bigint>>(
    new Set()
  );
  const [denizensLogBlocks, setDenizensLogBlocks] = useState<Set<bigint>>(
    new Set()
  );

  const {
    completeGame: {
      playersEventBlocks,
      actionsEventBlocks,
      gameEventBlocks,
      denizensEventBlocks,
      board,
    },
  } = props;

  const { setLogs, currentGameNumber } = props;

  // When props.completeGame.actionsEventBlock changes, get new logs from the blocks we don't have yet
  useEffect(() => {
    function buildBCEventEventLog(bcEvent: BCEvent, position: Position) {
      const { id } = bcEvent;
      const eventData = getEventFromId(id);
      const name = eventData[0].name;
      const newLog =
        "Player experienced " +
        name +
        " in " +
        roomDisplayDataList[board[position.row][position.col].roomId].name +
        " at row " +
        position.row +
        ", col " +
        position.col +
        ".";

      return newLog;
    }

    async function getLogs() {
      let newHistoricLogs: HistoricLog[] = [];

      // Check if actionsEventBlocks has changed and fetch logs
      const actionBlocks = actionsEventBlocks || [];
      const newActionBlocks: bigint[] = actionBlocks.filter(
        (block: bigint) => !actionsLogBlocks.has(block)
      );

      if (newActionBlocks.length > 0) {
        newActionBlocks.sort((a: bigint, b: bigint) =>
          a < b ? -1 : a > b ? 1 : 0
        );

        const actionsBlocksChunked: bigint[][] = splitIntoChunks(
          newActionBlocks,
          10000n
        );

        // Function to get logs for a single chunk
        async function getLogsForChunk(fromBlock: bigint, toBlock: bigint) {
          return await publicClient.getLogs({
            address: actionsContract.address,
            events: [
              getAbiItem({ abi: actionsContract.abi, name: "DiceRollEvent" }),
              getAbiItem({ abi: actionsContract.abi, name: "ChallengeEvent" }),
              getAbiItem({
                abi: actionsContract.abi,
                name: "ActionCompleteEvent",
              }),
            ],
            fromBlock,
            toBlock,
          });
        }

        // Call getLogs for each chunk
        const actionsLogsPromises = actionsBlocksChunked.map((chunk) =>
          getLogsForChunk(chunk[0], chunk[chunk.length - 1])
        );

        // Wait for all getLogs calls to resolve
        const actionsLogs = (await Promise.all(actionsLogsPromises)).flat();

        actionsLogs.forEach((log: any) => {
          if (log.args.gameId != currentGameNumber) {
            console.log("Log not for this game:", log);
            return;
          }
          switch (log.eventName) {
            case "DiceRollEvent":
              const newLog = buildDiceRollEventLog(log.args.roll);
              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "DiceRollEvent",
                log: newLog,
              });
              break;
            case "ChallengeEvent":
              const newLog2 = buildChallengeEventLog(
                log.args.roll,
                log.args.forValue,
                log.args.against
              );

              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "ChallengeEvent",
                log: newLog2,
              });
              break;
            case "ActionCompleteEvent":
              const { position } = log.args.player;
              const newLog3 =
                "Player " +
                log.args.playerId.toString() +
                " selected " +
                ActionString[log.args.action as Action] +
                " at row " +
                position.row.toString() +
                ", col " +
                position.col.toString();
              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "ActionCompleteEvent",
                log: newLog3,
              });
              break;
            default:
              throw new Error("ERROR: Missing log type" + log.eventName);
          }
        });
      }

      // Check if gameEventBlocks has changed and fetch logs
      const gameBlocks = gameEventBlocks || [];
      const newGameBlocks = gameBlocks.filter(
        (block: bigint) => !gamesLogBlocks.has(block)
      );

      if (newGameBlocks.length > 0) {
        newActionBlocks.sort((a: bigint, b: bigint) =>
          a < b ? -1 : a > b ? 1 : 0
        );

        const gamesBlocksChunked: bigint[][] = splitIntoChunks(
          newGameBlocks,
          10000n // Assuming you have a similar maximum difference here
        );

        // Function to get logs for a single chunk
        async function getLogsForGameChunk(fromBlock: bigint, toBlock: bigint) {
          return await publicClient.getLogs({
            address: gamesContract.address,
            events: [
              getAbiItem({ abi: gamesContract.abi, name: "DenizenTurnOver" }),
            ],
            fromBlock,
            toBlock,
          });
        }

        // Call getLogs for each chunk
        const gamesLogsPromises = gamesBlocksChunked.map((chunk) =>
          getLogsForGameChunk(chunk[0], chunk[chunk.length - 1])
        );

        // Wait for all getLogs calls to resolve and flatten the result
        const gamesLogs = (await Promise.all(gamesLogsPromises)).flat();

        gamesLogs.forEach((log: any) => {
          switch (log.eventName) {
            case "DenizenTurnOver":
              const newLog5 = "Denizen Turn Over";
              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "DenizenTurnOver",
                log: newLog5,
              });
              break;
            default:
              throw new Error("ERROR: Missing log type" + log.eventName);
          }
        });
      }

      // Check if playersEventBlocks has changed and fetch logs
      const playersBlocks = playersEventBlocks || [];
      const newPlayersBlocks = playersBlocks.filter(
        (block: bigint) => !playersLogBlocks.has(block)
      );

      if (newPlayersBlocks.length > 0) {
        newPlayersBlocks.sort((a: bigint, b: bigint) =>
          a < b ? -1 : a > b ? 1 : 0
        );

        const playersBlocksChunked: bigint[][] = splitIntoChunks(
          newPlayersBlocks,
          10000n // This is the maximum difference between the first and last block numbers in a chunk
        );

        // Function to get logs for a single chunk
        async function getLogsForPlayersChunk(
          fromBlock: bigint,
          toBlock: bigint
        ) {
          return await publicClient.getLogs({
            address: playersContract.address,
            events: [
              getAbiItem({
                abi: playersContract.abi,
                name: "DiceRollEvent",
              }),
              getAbiItem({
                abi: playersContract.abi,
                name: "PlayerDiedEvent",
              }),
              getAbiItem({
                abi: playersContract.abi,
                name: "EventResolvedEvent",
              }),
            ],
            fromBlock,
            toBlock,
          });
        }

        // Call getLogs for each chunk
        const playersLogsPromises = playersBlocksChunked.map((chunk) =>
          getLogsForPlayersChunk(chunk[0], chunk[chunk.length - 1])
        );

        // Wait for all getLogs calls to resolve and flatten the result
        const playersLogs = (await Promise.all(playersLogsPromises)).flat();

        playersLogs.forEach((log: any) => {
          switch (log.eventName) {
            case "DiceRollEvent":
              const newLog = buildDiceRollEventLog(log.args.roll);
              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "DiceRollEvent",
                log: newLog,
              });
              break;
            case "PlayerDiedEvent":
              const newLog2 =
                "Player with ID " + log.args.playerId.toString() + " died";
              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "PlayerDiedEvent",
                log: newLog2,
              });
              break;
            case "EventResolvedEvent":
              const newLog3 = buildBCEventEventLog(
                log.args.bcEvent,
                log.args.position
              );

              const newLog4 = createEffectLog(log.args.appliedBCEffects);

              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "EventResolvedEvent1",
                log: newLog3,
              });

              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "EventResolvedEvent2",
                log: newLog4,
              });
              break;
            default:
              throw new Error("ERROR: Missing log type" + log.eventName);
          }
        });
      }

      // Check if denizensEventBlocks has changed and fetch logs
      const denizensBlocks = denizensEventBlocks || [];
      const newDenizensBlocks = denizensBlocks.filter(
        (block: bigint) => !denizensLogBlocks.has(block)
      );

      if (newDenizensBlocks.length > 0) {
        newDenizensBlocks.sort((a: bigint, b: bigint) =>
          a < b ? -1 : a > b ? 1 : 0
        );

        const denizensLogs = await publicClient.getLogs({
          address: denizensContract.address,
          events: [
            getAbiItem({
              abi: denizensContract.abi,
              name: "DenizenAttack",
            }),
            getAbiItem({
              abi: denizensContract.abi,
              name: "PlayerAttack",
            }),
            getAbiItem({
              abi: denizensContract.abi,
              name: "DiceRollEvent",
            }),
            getAbiItem({
              abi: denizensContract.abi,
              name: "ChallengeEvent",
            }),
          ],
          fromBlock: newDenizensBlocks[0] as bigint,
          toBlock: newDenizensBlocks[newDenizensBlocks.length - 1] as bigint,
        });

        denizensLogs.forEach((log: any) => {
          switch (log.eventName) {
            case "DenizenAttack":
              const newLog3 = buildDenizenAttackLog(
                log.args.denizenType,
                log.args.denizenId,
                log.args.damage,
                log.args.turnabout
              );
              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "DenizenAttack",
                log: newLog3,
              });

              break;
            case "PlayerAttack":
              const newLog4 = buildPlayerAttackLog(
                log.args.playerId,
                log.args.damage,
                log.args.turnabout
              );

              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "PlayerAttack",
                log: newLog4,
              });
              break;
            case "DiceRollEvent":
              const newLog = buildDiceRollEventLog(log.args.roll);
              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "DiceRollEvent",
                log: newLog,
              });
              break;
            case "ChallengeEvent":
              const newLog2 = buildChallengeEventLog(
                log.args.roll,
                log.args.forValue,
                log.args.against
              );

              newHistoricLogs.push({
                blockNumber: log.blockNumber,
                logType: "ChallengeEvent",
                log: newLog2,
              });
              break;
            default:
              throw new Error("ERROR: Missing log type" + log.eventName);
          }
        });
      }

      if (newActionBlocks.length > 0) {
        // Update your state in a way that doesn't cause reruns unless necessary
        setActionsLogBlocks((prevBlocks) => {
          // Only update state if new blocks are actually different
          const allBlocks = new Set([
            ...Array.from(prevBlocks),
            ...newActionBlocks,
          ]);
          if (allBlocks.size !== prevBlocks.size) {
            return allBlocks;
          }
          return prevBlocks;
        });
      }

      if (newGameBlocks.length > 0) {
        // Update your state in a way that doesn't cause reruns unless necessary
        setGamesLogBlocks((prevBlocks) => {
          // Only update state if new blocks are actually different
          const allBlocks = new Set([
            ...Array.from(prevBlocks),
            ...newGameBlocks,
          ]);
          if (allBlocks.size !== prevBlocks.size) {
            return allBlocks;
          }
          return prevBlocks;
        });
      }

      if (newPlayersBlocks.length > 0) {
        // Update your state in a way that doesn't cause reruns unless necessary
        setPlayersLogBlocks((prevBlocks) => {
          // Only update state if new blocks are actually different
          const allBlocks = new Set([
            ...Array.from(prevBlocks),
            ...newPlayersBlocks,
          ]);
          if (allBlocks.size !== prevBlocks.size) {
            return allBlocks;
          }
          return prevBlocks;
        });
      }

      if (newDenizensBlocks.length > 0) {
        // Update your state in a way that doesn't cause reruns unless necessary
        setDenizensLogBlocks((prevBlocks) => {
          // Only update state if new blocks are actually different
          const allBlocks = new Set([
            ...Array.from(prevBlocks),
            ...newDenizensBlocks,
          ]);
          if (allBlocks.size !== prevBlocks.size) {
            return allBlocks;
          }
          return prevBlocks;
        });
      }

      const sortedHistoricLogs = sortHistoricLogs([
        ...historicLogs,
        ...newHistoricLogs,
      ]);
      const newLogs = mapHistoricLogsToLogs(sortedHistoricLogs);
      setHistoricLogs(sortedHistoricLogs);

      setLogs([...newLogs]);
    }

    getLogs();
  }, [
    actionsEventBlocks,
    actionsLogBlocks,
    board,
    currentGameNumber,
    denizensEventBlocks,
    denizensLogBlocks,
    gameEventBlocks,
    gamesLogBlocks,
    historicLogs,
    playersEventBlocks,
    playersLogBlocks,
    publicClient,
    setLogs,
  ]);

  function splitIntoChunks(
    sortedNumbers: bigint[],
    maxDiff: bigint = 10000n
  ): bigint[][] {
    const chunks: bigint[][] = [];
    let currentChunk: bigint[] = [];

    for (const number of sortedNumbers) {
      if (currentChunk.length === 0 || number - currentChunk[0] < maxDiff) {
        currentChunk.push(number);
      } else {
        chunks.push(currentChunk);
        currentChunk = [number];
      }
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk);
    }

    return chunks;
  }

  function buildDiceRollEventLog(roll: bigint) {
    const newLog = "A " + roll.toString() + " was rolled.";
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
        DenizenTypeToString.get(Number(effects[1].value.valueOf())) +
        " were placed"; // TODO: Add where
    } else {
      newLog = "The effects were " + effectNames.join("").slice(0, -2);
    }

    return newLog;
  }

  function buildDenizenAttackLog(
    denizenType: number,
    denizenId: number,
    damage: bigint,
    turnabout: bigint
  ) {
    const newLog =
      DenizenTypeToString.get(denizenType) +
      " #" +
      denizenId.toString() +
      " attacked player for " +
      damage.toString() +
      " and took turnabout of " +
      turnabout.toString();
    return newLog;
  }

  function buildPlayerAttackLog(
    playerId: number,
    damage: bigint,
    turnabout: bigint
  ) {
    const newLog =
      "Player #" +
      playerId.toString() +
      " attacked denizen for " +
      damage.toString() +
      " and took turnabout of " +
      turnabout.toString();
    return newLog;
  }

  function buildChallengeEventLog(
    roll: bigint,
    forValue: bigint,
    against: bigint
  ) {
    const newLog =
      "Challenge roll of: " +
      roll.toString() +
      ". For: " +
      forValue.toString() +
      " Against: " +
      against.toString();
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
      if (a.blockNumber < b.blockNumber) return -1;
      if (a.blockNumber > b.blockNumber) return 1;

      // blockNumbers are equal, sort by logType
      return logTypeOrder.indexOf(a.logType) - logTypeOrder.indexOf(b.logType);
    });
  }

  function mapHistoricLogsToLogs(historicLogs: HistoricLog[]): string[] {
    return historicLogs.map((log) => log.log);
  }
  return <></>;
}
