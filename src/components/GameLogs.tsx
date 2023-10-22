import { useContractRead, usePublicClient } from "wagmi";
import {
  actionsContract,
  denizensContract,
  gamesContract,
  playersContract,
} from "../contracts/index"; // TODO: Why does this complian if I don't have index in the path?
import { useState } from "react";
import { BCEffect, BCEvent, EffectNames, HistoricLog } from "./Board";
import { getAbiItem } from "viem";
import { polygonMumbai } from "viem/chains";
import { Position } from "../utils/Utils";
import { roomDisplayDataList } from "./RoomTiles";
import { GameTileInterface } from "./Tile";
import { getEventFromId } from "./EventData";
import { DenizenTypeToString } from "./Denizen";
import { Action, ActionString } from "./ActionPicker";

export interface GameLogProps {
  currentGameNumber: number;
  setLogs: Function;
  gameTiles: GameTileInterface[][];
}

export default function GameLogs(props: GameLogProps) {
  const publicClient = usePublicClient({
    chainId: polygonMumbai.id,
  });

  const [historicLogs, setHistoricLogs] = useState<HistoricLog[]>([]);

  const [actionsLogBlocks, setActionsLogBlocks] = useState<Set<BigInt>>(
    new Set()
  );
  const [gamesLogBlocks, setGamesLogBlocks] = useState<Set<BigInt>>(new Set());
  const [playersLogBlocks, setPlayersLogBlocks] = useState<Set<BigInt>>(
    new Set()
  );
  const [denizensLogBlocks, setDenizensLogBlocks] = useState<Set<BigInt>>(
    new Set()
  );

  useContractRead({
    address: actionsContract.address,
    abi: actionsContract.abi,
    functionName: "getEventBlocks",
    args: [props.currentGameNumber],
    watch: true,
    async onSettled(data, error) {
      if (data) {
        const blocks = data as BigInt[];
        // Filter blocks to include only ones not already in obtainedLogBlocks
        const newBlocks = blocks.filter(
          (block) => !actionsLogBlocks.has(block)
        );

        if (newBlocks.length === 0) {
          return;
        }

        let newHistoricLogs: HistoricLog[] = [];

        let promises: Promise<void>[] = newBlocks.map(async (block) => {
          const actionsLogs = await publicClient.getLogs({
            address: actionsContract.address,
            events: [
              getAbiItem({
                abi: actionsContract.abi,
                name: "DiceRollEvent",
              }),
              getAbiItem({
                abi: actionsContract.abi,
                name: "ChallengeEvent",
              }),
              getAbiItem({
                abi: actionsContract.abi,
                name: "ActionCompleteEvent",
              }),
            ],
            fromBlock: block as bigint,
            toBlock: block as bigint,
          });

          actionsLogs.forEach((log: any) => {
            // TODO: Any.  I think this should be Viem's log, but it's for some reason missing args and eventName
            // https://github.com/wagmi-dev/viem/discussions/501
            switch (log.eventName) {
              case "DiceRollEvent":
                const newLog = buildDiceRollEventLog(log.args.roll);
                newHistoricLogs.push({
                  blockNumber: block,
                  logType: "DiceRollEvent",
                  log: newLog,
                });
                break;
              case "ChallengeEvent":
                const newLog2 =
                  "Challenge roll of: " +
                  log.args.roll.toString() +
                  ". For: " +
                  log.args.forValue.toString() +
                  " Against: " +
                  log.args.against.toString();
                newHistoricLogs.push({
                  blockNumber: block,
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
                  blockNumber: block,
                  logType: "ActionCompleteEvent",
                  log: newLog3,
                });
                break;
              default:
                throw "ERROR: Missing log type" + log.eventName;
            }
          });
        });
        await Promise.all(promises);
        // Add new blocks to obtainedLogBlocks
        setActionsLogBlocks(new Set([...actionsLogBlocks, ...newBlocks]));
        // Combine and sort old and new logs
        const sortedHistoricLogs = sortHistoricLogs([
          ...historicLogs,
          ...newHistoricLogs,
        ]);

        // Map to string and set logs
        const newLogs = mapHistoricLogsToLogs(sortedHistoricLogs);
        setHistoricLogs(sortedHistoricLogs);

        props.setLogs([...newLogs]);
      }
    },
  });

  useContractRead({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "getEventBlocks",
    args: [props.currentGameNumber],
    watch: true,
    async onSettled(data, error) {
      if (data) {
        const blocks = data as BigInt[];
        // Filter blocks to include only ones not already in obtainedLogBlocks
        const newBlocks = blocks.filter((block) => !gamesLogBlocks.has(block));

        if (newBlocks.length === 0) {
          return;
        }

        let newHistoricLogs: HistoricLog[] = [];

        let promises: Promise<void>[] = newBlocks.map(async (block) => {
          const gamesLogs = await publicClient.getLogs({
            address: gamesContract.address,
            events: [
              getAbiItem({
                abi: gamesContract.abi,
                name: "DiceRollEvent",
              }),
              getAbiItem({
                abi: gamesContract.abi,
                name: "ChallengeEvent",
              }),

              getAbiItem({
                abi: gamesContract.abi,
                name: "DenizenTurnOver",
              }),
            ],
            fromBlock: block as bigint,
            toBlock: block as bigint,
          });

          gamesLogs.forEach((log: any) => {
            switch (log.eventName) {
              case "DiceRollEvent":
                const newLog = buildDiceRollEventLog(log.args.roll);
                newHistoricLogs.push({
                  blockNumber: block,
                  logType: "DiceRollEvent",
                  log: newLog,
                });
                break;
              case "ChallengeEvent":
                const newLog2 =
                  "Challenge roll of: " +
                  log.args.roll.toString() +
                  ". For: " +
                  log.args.forValue.toString() +
                  " Against: " +
                  log.args.against.toString();
                newHistoricLogs.push({
                  blockNumber: block,
                  logType: "ChallengeEvent",
                  log: newLog2,
                });
                break;
              case "DenizenTurnOver":
                const newLog5 = "Denizen Turn Over";
                newHistoricLogs.push({
                  blockNumber: block,
                  logType: "DenizenTurnOver",
                  log: newLog5,
                });
                break;
              default:
                throw "ERROR: Missing log type" + log.eventName;
            }
          });
        });
        await Promise.all(promises);
        // Add new blocks to obtainedLogBlocks
        setGamesLogBlocks(new Set([...gamesLogBlocks, ...newBlocks]));
        // Combine and sort old and new logs
        const sortedHistoricLogs = sortHistoricLogs([
          ...historicLogs,
          ...newHistoricLogs,
        ]);

        // Map to string and set logs
        const newLogs = mapHistoricLogsToLogs(sortedHistoricLogs);
        setHistoricLogs(sortedHistoricLogs);

        props.setLogs([...newLogs]);
      }
    },
  });

  useContractRead({
    address: playersContract.address,
    abi: playersContract.abi,
    functionName: "getEventBlocks",
    args: [props.currentGameNumber],
    watch: true,
    async onSettled(data, error) {
      if (data) {
        const blocks = data as BigInt[];
        // Filter blocks to include only ones not already in obtainedLogBlocks
        const newBlocks = blocks.filter(
          (block) => !playersLogBlocks.has(block)
        );

        if (newBlocks.length === 0) {
          return;
        }

        let newHistoricLogs: HistoricLog[] = [];

        let promises: Promise<void>[] = newBlocks.map(async (block) => {
          const playersLogs = await publicClient.getLogs({
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
            fromBlock: block as bigint,
            toBlock: block as bigint,
          });

          playersLogs.forEach((log: any) => {
            switch (log.eventName) {
              case "DiceRollEvent":
                const newLog = buildDiceRollEventLog(log.args.roll);
                newHistoricLogs.push({
                  blockNumber: block,
                  logType: "DiceRollEvent",
                  log: newLog,
                });
                break;
              case "PlayerDiedEvent":
                const newLog2 =
                  "Player with ID " + log.args.playerId.toString() + " died";
                newHistoricLogs.push({
                  blockNumber: block,
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
                  blockNumber: block,
                  logType: "EventResolvedEvent1",
                  log: newLog3,
                });

                newHistoricLogs.push({
                  blockNumber: block,
                  logType: "EventResolvedEvent2",
                  log: newLog4,
                });
                break;
              default:
                throw "ERROR: Missing log type" + log.eventName;
            }
          });
        });
        await Promise.all(promises);
        // Add new blocks to obtainedLogBlocks
        setPlayersLogBlocks(new Set([...playersLogBlocks, ...newBlocks]));
        // Combine and sort old and new logs
        const sortedHistoricLogs = sortHistoricLogs([
          ...historicLogs,
          ...newHistoricLogs,
        ]);

        // Map to string and set logs
        const newLogs = mapHistoricLogsToLogs(sortedHistoricLogs);
        setHistoricLogs(sortedHistoricLogs);

        props.setLogs([...newLogs]);
      }
    },
  });

  useContractRead({
    address: denizensContract.address,
    abi: denizensContract.abi,
    functionName: "getEventBlocks",
    args: [props.currentGameNumber],
    watch: true,
    async onSettled(data, error) {
      if (data) {
        const blocks = data as BigInt[];
        // Filter blocks to include only ones not already in obtainedLogBlocks
        const newBlocks = blocks.filter(
          (block) => !denizensLogBlocks.has(block)
        );

        if (newBlocks.length === 0) {
          return;
        }

        let newHistoricLogs: HistoricLog[] = [];

        let promises: Promise<void>[] = newBlocks.map(async (block) => {
          const gamesLogs = await publicClient.getLogs({
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
            ],
            fromBlock: block as bigint,
            toBlock: block as bigint,
          });

          gamesLogs.forEach((log: any) => {
            switch (log.eventName) {
              case "DenizenAttack":
                const newLog3 =
                  DenizenTypeToString.get(log.args.denizenType) +
                  " with ID " +
                  log.args.denizenId.toString() +
                  " attacked player " +
                  log.args.playerTarget.toString() +
                  " for " +
                  log.args.damage.toString() +
                  " and took turnabout of " +
                  log.args.turnabout.toString();
                newHistoricLogs.push({
                  blockNumber: block,
                  logType: "DenizenAttack",
                  log: newLog3,
                });
                break;
              case "PlayerAttack":
                const newLog4 =
                  "Player with ID " +
                  log.args.playerId.toString() +
                  " attacked " +
                  DenizenTypeToString.get(log.args.denizenType) +
                  " #" +
                  log.args.denizenId.toString() +
                  " for " +
                  log.args.damage.toString() +
                  " and took turnabout of " +
                  log.args.turnabout.toString();
                newHistoricLogs.push({
                  blockNumber: block,
                  logType: "PlayerAttack",
                  log: newLog4,
                });
                break;
              default:
                throw "ERROR: Missing log type" + log.eventName;
            }
          });
        });

        await Promise.all(promises);
        // Add new blocks to obtainedLogBlocks
        setDenizensLogBlocks(new Set([...denizensLogBlocks, ...newBlocks]));
        // Combine and sort old and new logs
        const sortedHistoricLogs = sortHistoricLogs([
          ...historicLogs,
          ...newHistoricLogs,
        ]);

        // Map to string and set logs
        const newLogs = mapHistoricLogsToLogs(sortedHistoricLogs);
        setHistoricLogs(sortedHistoricLogs);

        props.setLogs([...newLogs]);
      }
    },
  });

  function buildDiceRollEventLog(roll: bigint) {
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
      roomDisplayDataList[props.gameTiles[position.row][position.col].roomId]
        .name +
      " at row " +
      position.row +
      ", col " +
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
        DenizenTypeToString.get(Number(effects[1].value.valueOf())) +
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
