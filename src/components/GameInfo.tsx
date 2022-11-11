import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import { GameInterface, GameInfoInterface } from "./GamePanel";
import Player, { PlayerInterface } from "./Player";

export default function GameInfo(props: GameInfoInterface) {
  return (
    <Card>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Card>
                    <CardHeader
                      title="Game Info"
                    />
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
                            {props.currentGameNumber}
                          </Typography>
                          <Typography variant="body1">
                            {props.currentGameProps.currentPlayerTurnIndex.toString()}
                          </Typography>
                          <Typography variant="body1">
                            {props.currentChar.id.toString()}
                          </Typography>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardHeader
                      title="Event Tracker"
                    />
                    <CardContent>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="left">
                            Bug:
                          </Typography>
                          <Typography variant="body1" align="left">
                            Mystery:
                          </Typography>
                          <Typography variant="body1" align="left">
                            Scavenger:
                          </Typography>
                          <Typography variant="body1" align="left">
                            Ship:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {props.currentGameProps.eventTracker.bugEvents.toString()}
                          </Typography>
                          <Typography variant="body1">
                            {props.currentGameProps.eventTracker.mysteryEvents.toString()}
                          </Typography>
                          <Typography variant="body1">
                            {props.currentGameProps.eventTracker.scavEvents.toString()}
                          </Typography>
                          <Typography variant="body1">
                            {props.currentGameProps.eventTracker.shipEvents.toString()}
                          </Typography>
                        </Grid>
                      </Grid>

                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={0}>
            <Grid item xs={6}>
              <Player {...{ player: props.currentPlayer, portrait: true }} />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                Dmg. Taken: {props.currentPlayer.healthDmgTaken.toString()}/{props.currentChar.traits.health}
              </Typography>
              <Typography variant="body1">
                Carrying: {props.allHeldItems[props.currentGameProps.currentPlayerTurnIndex].length}/{props.currentChar.traits.carry}
              </Typography>
              <Typography variant="body1">
                Defense: {props.currentChar.traits.defense}
              </Typography>
              <Typography variant="body1">
                Vs. Hack: {props.currentChar.traits.hack}
              </Typography>
              <Typography variant="body1">
                Vs. Breach: {props.currentChar.traits.breach}
              </Typography>
              <Typography variant="body1">
                Shoot: {props.currentChar.traits.shoot}
              </Typography>
              <Typography variant="body1">
                Melee: {props.currentChar.traits.melee}
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
