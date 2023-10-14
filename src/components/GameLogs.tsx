export default function GameLogs() {
  // useContractRead({
  //   address: actionsContract.address,
  //   abi: actionsContract.abi,
  //   functionName: "getEventBlocks",
  //   args: [props.currentGameNumber],
  //   watch: true,
  //   onSettled(data, error) {
  //     if (data) {
  //       const blocks = data as BigNumber[];
  //       // Filter blocks to include only ones not already in obtainedLogBlocks
  //       const newBlocks = blocks.filter((block) => !obtainedLogBlocks.has(block));

  //       for (const block in newBlocks) {
  //         const logs = await publicClient.getLogs({

  //       }
  //     }
  //   }
  // });

  // // TODO: Decompose this to a component
  // const getLogBlocks = async () => {
  //   const historicLogs: HistoricLog[] = [];

  //   const actionsBlocks = await props.actionsContract_read.getEventBlocks(
  //     props.currentGameNumber
  //   );

  //   // DON'T SORT NOW, WILL SORT AFTER WE HAVE THEM ALL
  //   // Then create filters for the DiceRollEvent, ChallengeEvent, and ActionCompleteEvent in the actions contract
  //   // console.log("actionsBlocks", actionsBlocks);
  //   const actionsInterface = new ethers.utils.Interface(
  //     actionsContractDeployData.abi
  //   );

  //   // TODO: It's probably not efficient to make all these filters more than once
  //   const actionsDiceRollEventFilter =
  //     await props.actionsContract_read.filters.DiceRollEvent();

  //   const actionsChallengeEventFilter =
  //     await props.actionsContract_read.filters.ChallengeEvent();

  //   const actionCompleteEventFilter =
  //     await props.actionsContract_read.filters.ActionCompleteEvent();

  //   for (const blockNumber of actionsBlocks) {
  //     const diceRollEvents = await props.actionsContract_read.queryFilter(
  //       actionsDiceRollEventFilter,
  //       blockNumber.toNumber(),
  //       blockNumber.toNumber()
  //     );

  //     for (const diceRollEvent of diceRollEvents) {
  //       const parsedEvent = actionsInterface.parseLog(diceRollEvent);
  //       // console.log("parsedEvent", parsedEvent);
  //       if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
  //         const newLog = buildDiceRollEventLog(parsedEvent.args.roll);

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "DiceRollEvent",
  //           log: newLog,
  //         });
  //       }
  //     }

  //     const challengeEvents = await props.actionsContract_read.queryFilter(
  //       actionsChallengeEventFilter,
  //       blockNumber.toNumber(),
  //       blockNumber.toNumber()
  //     );

  //     for (const challengeEvent of challengeEvents) {
  //       const parsedEvent = actionsInterface.parseLog(challengeEvent);
  //       // console.log("parsedEvent", parsedEvent);
  //       if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
  //         const newLog =
  //           "Challenge roll of: " +
  //           parsedEvent.args.roll.toString() +
  //           ". For: " +
  //           parsedEvent.args.forValue.toString() +
  //           " Against: " +
  //           parsedEvent.args.against.toString();

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "ChallengeEvent",
  //           log: newLog,
  //         });
  //       }
  //     }

  //     const actionCompleteEvents = await props.actionsContract_read.queryFilter(
  //       actionCompleteEventFilter,
  //       blockNumber.toNumber(),
  //       blockNumber.toNumber()
  //     );

  //     for (const actionCompleteEvent of actionCompleteEvents) {
  //       const parsedEvent = actionsInterface.parseLog(actionCompleteEvent);
  //       // console.log("parsedActionCompleteEvent", parsedEvent);
  //       if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
  //         const { position } = parsedEvent.args.player;
  //         const newLog =
  //           "Player " +
  //           parsedEvent.args.playerId.toString() +
  //           " selected " +
  //           ActionString[parsedEvent.args.action as Action] +
  //           " at row " +
  //           position.row.toString() +
  //           ", col " +
  //           position.col.toString();

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "ActionCompleteEvent",
  //           log: newLog,
  //         });
  //       }
  //     }
  //   }

  //   const gamesBlocks = await props.gameContract_read.getEventBlocks(
  //     props.currentGameNumber
  //   );

  //   const gamesInterface = new ethers.utils.Interface(
  //     gamesContractDeployData.abi
  //   );

  //   const gamesDiceRollEventFilter =
  //     await props.gameContract_read.filters.DiceRollEvent();

  //   const gamesChallengeEventFilter =
  //     await props.gameContract_read.filters.ChallengeEvent();

  //   const denizenAttackEventFilter =
  //     await props.gameContract_read.filters.DenizenAttack();

  //   const playerAttackEventFilter =
  //     await props.gameContract_read.filters.PlayerAttack();

  //   const playerDiceRollEventFilter =
  //     await props.playersContract_read.filters.DiceRollEvent();

  //   const playerDiedEventFilter =
  //     await props.playersContract_read.filters.PlayerDiedEvent();

  //   const denizenTurnOverFilter =
  //     await props.gameContract_read.filters.DenizenTurnOver();

  //   for (const blockNumber of gamesBlocks) {
  //     const diceRollEvents = await props.gameContract_read.queryFilter(
  //       gamesDiceRollEventFilter,
  //       blockNumber.toNumber(),
  //       blockNumber.toNumber()
  //     );

  //     for (const diceRollEvent of diceRollEvents) {
  //       const parsedEvent = gamesInterface.parseLog(diceRollEvent);
  //       // console.log("parsedEvent", parsedEvent);
  //       if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
  //         const newLog = buildDiceRollEventLog(parsedEvent.args.roll);

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "DiceRollEvent",
  //           log: newLog,
  //         });
  //       }
  //     }

  //     const challengeEvents = await props.gameContract_read.queryFilter(
  //       gamesChallengeEventFilter,
  //       blockNumber.toNumber(),
  //       blockNumber.toNumber()
  //     );

  //     for (const challengeEvent of challengeEvents) {
  //       const parsedEvent = gamesInterface.parseLog(challengeEvent);
  //       // console.log("parsedEvent", parsedEvent);
  //       if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
  //         const newLog =
  //           "Challenge roll of: " +
  //           parsedEvent.args.roll.toString() +
  //           ". For: " +
  //           parsedEvent.args.forValue.toString() +
  //           " Against: " +
  //           parsedEvent.args.against.toString();

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "ChallengeEvent",
  //           log: newLog,
  //         });
  //       }
  //     }

  //     const denizenAttackEvents = await props.gameContract_read.queryFilter(
  //       denizenAttackEventFilter,
  //       blockNumber.toNumber(),
  //       blockNumber.toNumber()
  //     );

  //     for (const denizenAttackEvent of denizenAttackEvents) {
  //       const parsedEvent = gamesInterface.parseLog(denizenAttackEvent);
  //       // console.log("parsedEvent", parsedEvent);
  //       if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
  //         const newLog =
  //           DenizenTypeToString.get(parsedEvent.args.denizenType) +
  //           " with ID " +
  //           parsedEvent.args.denizenId.toString() +
  //           " attacked player " +
  //           parsedEvent.args.playerTarget.toString() +
  //           " for " +
  //           parsedEvent.args.damage.toString() +
  //           " and took turnabout of " +
  //           parsedEvent.args.turnabout.toString();

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "DenizenAttack",
  //           log: newLog,
  //         });
  //       }
  //     }

  //     const playerAttackEvents = await props.gameContract_read.queryFilter(
  //       playerAttackEventFilter,
  //       blockNumber.toNumber(),
  //       blockNumber.toNumber()
  //     );

  //     for (const playerAttackEvent of playerAttackEvents) {
  //       const parsedEvent = gamesInterface.parseLog(playerAttackEvent);
  //       // console.log("parsedEvent", parsedEvent);
  //       if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
  //         const newLog =
  //           "Player with ID " +
  //           parsedEvent.args.playerId.toString() +
  //           " attacked " +
  //           DenizenTypeToString.get(parsedEvent.args.denizenType) +
  //           " #" +
  //           parsedEvent.args.denizenId.toString() +
  //           " for " +
  //           parsedEvent.args.damage.toString() +
  //           " and took turnabout of " +
  //           parsedEvent.args.turnabout.toString();

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "PlayerAttack",
  //           log: newLog,
  //         });
  //       }
  //     }

  //     const denizenTurnOverEvents = await props.gameContract_read.queryFilter(
  //       denizenTurnOverFilter,
  //       blockNumber.toNumber(),
  //       blockNumber.toNumber()
  //     );

  //     for (const denizenTurnOverEvent of denizenTurnOverEvents) {
  //       const parsedEvent = gamesInterface.parseLog(denizenTurnOverEvent);
  //       // console.log("parsedEvent", parsedEvent);
  //       if (parsedEvent.args.gameId.toNumber() === props.currentGameNumber) {
  //         const newLog = "Denizen Turn Over";

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "DenizenTurnOver",
  //           log: newLog,
  //         });
  //       }
  //     }
  //   }

  //   const playersBlocks = await props.playersContract_read.getEventBlocks(
  //     props.currentGameNumber
  //   );

  //   const playersInterface = new ethers.utils.Interface(
  //     playersContractDeployData.abi
  //   );

  //   const eventResolvedEventFilter =
  //     await props.playersContract_read.filters.EventResolvedEvent();

  //   for (const blockNumber of playersBlocks) {
  //     const eventResolvedEvents = await props.playersContract_read.queryFilter(
  //       eventResolvedEventFilter,
  //       blockNumber.toNumber(),
  //       blockNumber.toNumber()
  //     );

  //     for (const eventResolvedEvent of eventResolvedEvents) {
  //       const parsedEvent = playersInterface.parseLog(eventResolvedEvent);
  //       // console.log("parsedEvent", parsedEvent);
  //       if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
  //         const newLog = buildBCEventEventLog(
  //           parsedEvent.args.bcEvent,
  //           parsedEvent.args.position
  //         );

  //         const newLog2 = createEffectLog(parsedEvent.args.appliedBCEffects);

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "EventResolvedEvent1",
  //           log: newLog,
  //         });

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "EventResolvedEvent2",
  //           log: newLog2,
  //         });
  //       }
  //     }

  //     const playerDiceRollEvents = await props.playersContract_read.queryFilter(
  //       playerDiceRollEventFilter,
  //       blockNumber.toNumber(),
  //       blockNumber.toNumber()
  //     );

  //     for (const playerDiceRollEvent of playerDiceRollEvents) {
  //       const parsedEvent = playersInterface.parseLog(playerDiceRollEvent);
  //       // console.log("parsedEvent", parsedEvent);
  //       if (parsedEvent.args.gameId.toNumber() == props.currentGameNumber) {
  //         const newLog = buildDiceRollEventLog(parsedEvent.args.roll);

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "EventDiceRollEvent",
  //           log: newLog,
  //         });
  //       }
  //     }

  //     const playerDiedEvents = await props.playersContract_read.queryFilter(
  //       playerDiedEventFilter,
  //       blockNumber.toNumber(),
  //       blockNumber.toNumber()
  //     );

  //     for (const playerDiedEvent of playerDiedEvents) {
  //       const parsedEvent = playersInterface.parseLog(playerDiedEvent);
  //       // console.log("parsedEvent", parsedEvent);
  //       if (parsedEvent.args.gameId.toNumber() === props.currentGameNumber) {
  //         const newLog =
  //           "Player " +
  //           parsedEvent.args.playerId.toString() +
  //           " died at " +
  //           parsedEvent.args.position.row.toString() +
  //           ", " +
  //           parsedEvent.args.position.col.toString() +
  //           " from " +
  //           parsedEvent.args.damage.toString() +
  //           " damage";

  //         historicLogs.push({
  //           blockNumber,
  //           logType: "PlayerDiedEvent",
  //           log: newLog,
  //         });
  //       }
  //     }
  //   }

  //   // TODO: After events are added to items contract
  //   // const itemsBlocks = await props.itemContract_read.getEventBlocks(
  //   //   props.currentGameNumber
  //   // );
  //   const sortedHistoricLogs = sortHistoricLogs(historicLogs);
  //   const newLogs = mapHistoricLogsToLogs(sortedHistoricLogs);
  //   setLogs([...newLogs]);
  // };

  // function buildDiceRollEventLog(roll: BigNumber) {
  //   const newLog = "A " + roll.toString() + " was rolled.";
  //   return newLog;
  // }

  // function buildBCEventEventLog(bcEvent: BCEvent, position: Position) {
  //   const { id } = bcEvent;
  //   const eventData = getEventFromId(id);
  //   const name = eventData[0].name;
  //   const newLog =
  //     "Player experienced " +
  //     name +
  //     " in " +
  //     roomDisplayDataList[gameTiles[position.row][position.col].roomId].name +
  //     " at row " +
  //     position.row +
  //     ", col " +
  //     position.col +
  //     ".";

  //   return newLog;
  // }

  // function createEffectLog(effects: BCEffect[]) {
  //   const effectNames = effects.map((effect: BCEffect) => {
  //     return EffectNames[effect.effect] + ", ";
  //   });

  //   let newLog;

  //   if (effectNames.length === 0) {
  //     return "This event is not yet implemented";
  //   }

  //   if (effectNames[0] === "numEnemyToPlace, ") {
  //     newLog =
  //       effects[0].value +
  //       " " +
  //       DenizenTypeToString.get(
  //         ethers.BigNumber.from(effects[1].value).toNumber()
  //       ) +
  //       " were placed"; // TODO: Add where
  //   } else {
  //     newLog = "The effects were " + effectNames.join("").slice(0, -2);
  //   }

  //   return newLog;
  // }

  // function sortHistoricLogs(historicLogs: HistoricLog[]) {
  //   const logTypeOrder = [
  //     "ActionCompleteEvent",
  //     "EventResolvedEvent1",
  //     "EventDiceRollEvent",
  //     "EventResolvedEvent2",
  //     "PlayerAttack",
  //     "DenizenAttack",
  //     "DiceRollEvent",
  //     "ChallengeEvent",
  //     "PlayerDiedEvent",
  //     "DenizenTurnOver",
  //   ];

  //   return historicLogs.sort((a, b) => {
  //     if (a.blockNumber.lt(b.blockNumber)) return -1; // assuming BigNumber has lt method for less than comparison
  //     if (a.blockNumber.gt(b.blockNumber)) return 1; // assuming BigNumber has gt method for greater than comparison

  //     // blockNumbers are equal, sort by logType
  //     return (
  //       logTypeOrder.indexOf(a.logType) - logTypeOrder.indexOf(b.logType)
  //     );
  //   });
  // }

  // function mapHistoricLogsToLogs(historicLogs: HistoricLog[]): string[] {
  //   return historicLogs.map((log) => log.log);
  // }

  return <></>;
}
