import { Button, Card, Typography } from "@mui/material";
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
          mapContract,
          mapId
        } = newGame;

        const localGame = {
          active: active,
          playerIndexes: await props.gameContract_read.extGetGamePlayerIndexes(gameIds[i]),
          currentPlayerTurnIndex: currentPlayerTurnIndex,
          numPlayers: numPlayers,
          turnsTaken: turnsTaken,
          mapContract: mapContract,
          mapId: mapId,
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
    props.setCurrentGameNumber(id);
    props.setTabValue(2);
  }

  function renderGameData() {
    const gameList: ReactNode[] = []
    games.forEach((game: GameInterface, index: number) => {
      gameList.push(
        <Card key={index + " Game card"}>
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
          <Button variant="contained" onClick={() => { handleGameButtonClick(game.gameNumber) }}>Load Game</Button>
        </Card>
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
        {renderGameData()}
      </Box>
    </Box>
  )
}
