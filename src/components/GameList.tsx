import {
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  List,
  ListItem,
} from "@mui/material";
import { Box } from "@mui/system";
import { ethers } from "ethers";
import { ReactNode, useEffect, useState } from "react";
import { CharInterface } from "./Board";
import { GameInterface } from "./GamePanel";

interface GameListDataInterface {
  gameContract_read: any; // todo any
  setCurrentGameNumber: Function;
  setTabValue: Function;
  address: string;
}

export default function GameList(props: GameListDataInterface) {
  const [gamesLoaded, setGamesLoaded] = useState(false);
  const [games, setGames] = useState<GameInterface[]>([]);

  useEffect(() => {
    async function updateGamesFromChain() {
      const gameIds = await props.gameContract_read.extGetGamesOfPlayer(
        props.address
      );
      const newGames: GameInterface[] = [];

      for (let i = 0; i < gameIds.length; i++) {
        const newGame = await props.gameContract_read.games(gameIds[i]);
        newGames.push({
          ...newGame,
          playerIndexes: await props.gameContract_read.extGetGamePlayerIndexes(
            gameIds[i]
          ),
          gameNumber: gameIds[i],
        });
      }

      setGames(newGames);
      setGamesLoaded(true);
    }

    if (!gamesLoaded) {
      updateGamesFromChain();
    }
  }, [gamesLoaded, props.address, props.gameContract_read]);

  const handleGameButtonClick = (id: number) => {
    localStorage.setItem("lastGame", id.toString());
    localStorage.setItem("lastTab", "2");
    const intId = ethers.BigNumber.from(id).toNumber();
    props.setCurrentGameNumber(intId);
    props.setTabValue(2);
  };

  const renderGameData = () => {
    return games.map((game: GameInterface, index: number) => (
      <Grid item key={index + " Game card"}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Game Number: {game.gameNumber.toString()}
            </Typography>
            <List>
              <ListItem>
                <Typography variant="body1">
                  Active: {game.active.toString()}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  Players: {game.playerIndexes.toString()}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  Current Player Turn Index:{" "}
                  {game.currentPlayerTurnIndex.toString()}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  Turns Taken: {game.turnsTaken.toString()}
                </Typography>
              </ListItem>
              <ListItem>
                <Typography variant="body1">
                  Map ID: {game.mapId.toString()}
                </Typography>
              </ListItem>
            </List>
          </CardContent>
          <Button
            variant="contained"
            onClick={() => handleGameButtonClick(game.gameNumber)}
            sx={{ m: 2 }}
          >
            Load Game
          </Button>
        </Card>
      </Grid>
    ));
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Number of Games In: {games.length}
      </Typography>
      <Grid container spacing={2}>
        {renderGameData()}
      </Grid>
    </Box>
  );
}
