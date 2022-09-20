import { Card, Grid, Typography } from "@mui/material";
import { GameInterface, GameInfoInterface } from "./GamePanel";
import Player, { PlayerInterface } from "./Player";

export default function GameInfo(props: GameInfoInterface) {

  return (
    <Card>
      <Grid container spacing={0}>
        <Grid item xs={12}>
          <Typography variant="h5">
            Game Info
          </Typography>
          <Typography variant="body1">
            Game Number: {props.currentGameNumber}
          </Typography>
          <Typography variant="body1">
            Current Player: {props.currentGameProps.currentPlayerTurnIndex.toString()}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={0}>
            <Grid item xs={6}>
              <Player {...{ player: props.currentPlayer, portrait: true }} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                Stat1: {1}
              </Typography>
              <Typography variant="body1">
                {/* Damage Taken: {props.currentPlayer.healthDmgTaken.toString()} / {props.currentChar.traits.health} */}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Card>
        <Typography variant="body1">
          Owner: {props.currentPlayer.owner.toString()}
        </Typography>
        <Typography variant="body1">
          ID Number: {props.currentPlayer.characterId.toString()}
        </Typography>
        <Typography variant="body1">
          Actions Taken: {props.currentPlayer.actionsTaken.toString()}
        </Typography>
        <Typography variant="body1">
          Data Tokens: {props.currentPlayer.dataTokens.toString()}
        </Typography>

      </Card>
    </Card>
  )
}
