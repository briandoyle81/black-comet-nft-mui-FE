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
                <Grid item xs={12}>
                  <Card>
                    <CardHeader
                      title="Event Tracker"
                    />
                      <Grid container spacing={0}>
                        <Grid item xs={6}>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="body1" align="left">
                                Bug:
                              </Typography>
                              <Typography variant="body1" align="left">
                                Mystery:
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body1">
                                {props.currentGameProps.eventTracker.bugEvents.toString()}
                              </Typography>
                              <Typography variant="body1">
                                {props.currentGameProps.eventTracker.mysteryEvents.toString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={6}>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="body1" align="left">
                                Scavenger:
                              </Typography>
                              <Typography variant="body1" align="left">
                                Ship:
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body1">
                                {props.currentGameProps.eventTracker.scavEvents.toString()}
                              </Typography>
                              <Typography variant="body1">
                                {props.currentGameProps.eventTracker.shipEvents.toString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                  </Card>
                  <Card>
                    <CardHeader
                      title="Current Player"
                    />
                      <Grid container spacing={0}>
                        <Grid item xs={6}>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="body1" align="left">
                                Owner:
                              </Typography>
                              <Typography variant="body1" align="left">
                                ID #:
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body1">
                                {props.currentPlayer.owner.toString().slice(0,5) + "..."}
                              </Typography>
                              <Typography variant="body1">
                                {props.currentPlayer.characterId.toString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                        <Grid item xs={6}>
                          <Grid container spacing={1}>
                            <Grid item xs={6}>
                              <Typography variant="body1" align="left">
                                Actions:
                              </Typography>
                              <Typography variant="body1" align="left">
                                Data:
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography variant="body1">
                                {props.currentPlayer.actionsTaken.toString()}
                              </Typography>
                              <Typography variant="body1">
                                {props.currentPlayer.dataTokens.toString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </Grid>
                      </Grid>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={0}>
            <Grid item xs={6}>
              <Player
                {...{
                  player: props.currentPlayer,
                  portrait: true,
                  genHash: props.currentChar.genHash
                }
                }
              />
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
    </Card>
  )
}
