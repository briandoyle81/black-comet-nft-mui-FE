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
import { useState } from "react";
import { GameInterface } from "./GamePanel";
import { useContractRead } from "wagmi";
import { gamesContract } from "../contracts";

interface GameListDataInterface {
  setCurrentGameNumber: Function;
  setTabValue: Function;
  address: string;
}

export default function GameList(props: GameListDataInterface) {
  const [games, setGames] = useState<GameInterface[]>([]);

  useContractRead({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "extGetGamesOfPlayer",
    args: [props.address],
    watch: true,
    onSettled: (data) => {
      if (data) {
        setGames(data as GameInterface[]);
      }
    },
  });

  const handleGameButtonClick = (id: number) => {
    localStorage.setItem("lastGame", id.toString());
    localStorage.setItem("lastTab", "2");
    const intId = id as number;
    props.setCurrentGameNumber(intId);
    props.setTabValue(2);
  };

  const renderGameData = () => {
    return games.map((game: GameInterface, index: number) => (
      <Grid item key={index + " Game card"}>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Game Number: {game.gameId.toString()}
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
            onClick={() => handleGameButtonClick(game.gameId)}
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
