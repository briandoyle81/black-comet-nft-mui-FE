import React from "react";
import { Card, CardHeader, CardContent, Typography, Grid } from "@mui/material";
import { GameInfoInterface } from "./GamePanel";

export default function GameInfoCard(currentGameProps: GameInfoInterface) {
  return (
    <Grid item xs={12}>
      <Card>
        <CardHeader title="Game Info" />
        <CardContent>
          <Grid container spacing={1}>
            <Grid item xs={9}>
              <Typography variant="body1" align="left">
                Game #:
              </Typography>
              <Typography variant="body1" align="left">
                Current Player:
              </Typography>
              <Typography variant="body1" align="left">
                Id Number:
              </Typography>
            </Grid>
            <Grid item xs={3}>
              <Typography variant="body1">
                {currentGameProps.currentGameNumber}
              </Typography>
              <Typography variant="body1">
                {currentGameProps.currentGameProps.currentPlayerTurnIndex.toString()}
              </Typography>
              <Typography variant="body1">
                {currentGameProps.currentChar.id.toString()}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Grid>
  );
}
