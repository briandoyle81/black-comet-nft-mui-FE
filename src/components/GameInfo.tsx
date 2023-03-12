import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import { GameInterface, GameInfoInterface } from "./GamePanel";
import Player, { PlayerInterface } from "./Player";

export default function GameInfo(props: GameInfoInterface) {
  function getTraitColor(charTrait: number, modifiedTrait: number) {
    if (charTrait > modifiedTrait) {
      return "red";
    }
    if (charTrait < modifiedTrait) {
      return "green";
    }
    return "white";
  }
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
            <Grid item xs={4}>
              <Player
                {...{
                  player: props.currentPlayer,
                  portrait: true,
                  genHash: props.currentChar.genHash
                }
                }
              />
            </Grid>
            <Grid item xs={8}>
              <Typography variant="body1" color={getTraitColor(props.currentChar.traits.health, props.currentPlayer.currentTraits.health)}>
                Dmg. Taken: {props.currentPlayer.healthDmgTaken.toString()}/{props.currentPlayer.currentTraits.health}
              </Typography>
              <Typography variant="body1" color={getTraitColor(props.currentChar.traits.carry, props.currentPlayer.currentTraits.carry)}>
                Carrying: {props.allHeldItems[props.currentGameProps.currentPlayerTurnIndex].length}/{props.currentPlayer.currentTraits.carry}
              </Typography>
              <Typography variant="body1" color={getTraitColor(props.currentChar.traits.defense, props.currentPlayer.currentTraits.defense)}>
                Defense: {props.currentPlayer.currentTraits.defense}
              </Typography>
              <Typography variant="body1" color={getTraitColor(props.currentChar.traits.hack, props.currentPlayer.currentTraits.hack)}>
                Vs. Hack: {props.currentPlayer.currentTraits.hack}
              </Typography>
              <Typography variant="body1" color={getTraitColor(props.currentChar.traits.breach, props.currentPlayer.currentTraits.breach)}>
                Vs. Breach: {props.currentPlayer.currentTraits.breach}
              </Typography>
              <Typography variant="body1" color={getTraitColor(props.currentChar.traits.shoot, props.currentPlayer.currentTraits.shoot)}>
                Shoot: {props.currentPlayer.currentTraits.shoot}
              </Typography>
              <Typography variant="body1" color={getTraitColor(props.currentChar.traits.melee, props.currentPlayer.currentTraits.melee)}>
                Melee: {props.currentPlayer.currentTraits.melee}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  )
}
