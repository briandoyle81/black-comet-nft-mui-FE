import { Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system"
import { ethers } from "ethers";
import { ReactNode, useEffect, useState } from "react";
import { CharInterface } from "./Board";
import { GameInterface } from "./GamePanel";


interface GameListDataInterface {
  gameContract_read: any, // todo any
  setCurrentGameNumber: Function,
  setTabValue: Function,
  address: string
}

export default function GameList(props: GameListDataInterface) {

  const [gamesLoaded, setGamesLoaded] = useState(false);
  const [games, setGames] = useState<GameInterface[]>([]);

  useEffect(() => {
    console.log("Start of useEffect in GameList");

    async function updateGamesFromChain() {
      const gameIds = await props.gameContract_read.extGetGamesOfPlayer(props.address);

      const newGames: GameInterface[] = [];

      for (let i = 0; i < gameIds.length; i++) {
        const newGame = await props.gameContract_read.games(gameIds[i]);
        const {
          active,
          currentPlayerTurnIndex,
          numPlayers,
          turnsTaken,
          eventTracker,
          mapId,
          eventPlayerId,
          eventNumber,
          eventType,
          eventPosition,
          turnTimeLimit,
          lastTurnTimestamp,
          denizens,
        } = newGame;

        const localGame = {
          active: active,
          playerIndexes: await props.gameContract_read.extGetGamePlayerIndexes(gameIds[i]),
          currentPlayerTurnIndex: currentPlayerTurnIndex,
          numPlayers: numPlayers,
          turnsTaken: turnsTaken,
          eventTracker: eventTracker,
          mapId: mapId,
          eventPlayerId: eventPlayerId,
          eventNumber: eventNumber,
          eventType: eventType,
          eventPosition: eventPosition,
          turnTimeLimit: turnTimeLimit,
          lastTurnTimestamp: lastTurnTimestamp,
          denizens: denizens,
          gameNumber: gameIds[i]
        }
        newGames.push(localGame);
      }

      setGames(newGames);
      setGamesLoaded(true);
    }

    if (!gamesLoaded) {
      updateGamesFromChain();
    }

  }, [gamesLoaded, props.address, props.gameContract_read]);


  function handleGameButtonClick(id: number) {
    localStorage.setItem("lastGame", id.toString())
    // props.setCurrentGameNumber(id);
    props.setTabValue(2);
  }

  function renderGameData() {
    const gameList: ReactNode[] = []
    games.forEach((game: GameInterface, index: number) => {
      gameList.push(
        <Grid item key={index + " Game card"}>
          <Card>
            <CardContent>
              <Typography variant="body1">
                Game Number: {game.gameNumber.toString()}
              </Typography>
              <Typography variant="body1">
                Active: {game.active.toString()}
              </Typography>
              <Typography variant="body1">
                Players: {game.playerIndexes.toString()}
              </Typography>
              <Typography variant="body1">
                Current Player Turn Index: {game.currentPlayerTurnIndex.toString()}
              </Typography>
              <Typography variant="body1">
                Turns Taken: {game.turnsTaken.toString()}
              </Typography>
              <Typography variant="body1">
                Map ID: {game.mapId.toString()}
              </Typography>
            </CardContent>
            <Button variant="contained" onClick={() => { handleGameButtonClick(game.gameNumber) }}>Load Game</Button>
            </Card>
          </Grid>
      )
    })
    return gameList;
  }

  return (
    <Box>
      <Typography variant="body1">
        Number of Games In: {games.length}
      </Typography>
      <Box>
        <Grid container>
          {renderGameData()}
        </Grid>
      </Box>
    </Box>
  )
}
