import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import { GameInfoInterface } from "./GamePanel";
import Player from "./Player";
import HeartIcon from "../assets/img/misc/round heart token.png";

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

  function renderHealth() {
    let healthIcons = [];
    let currentHealth =
      props.currentPlayer.currentTraits.health -
      props.currentPlayer.healthDmgTaken;

    let numNormal;
    if (currentHealth <= props.currentPlayer.currentTraits.health) {
      numNormal = currentHealth;
    } else {
      numNormal = props.currentPlayer.currentTraits.health;
    }

    for (let i = 0; i < numNormal; i++) {
      healthIcons.push(
        <img
          key={"heart" + i}
          src={HeartIcon}
          alt="heart"
          style={{ height: "30px", width: "30px" }}
        />
      );
    }

    if (currentHealth < props.currentPlayer.currentTraits.health) {
      const numLost = props.currentPlayer.healthDmgTaken;

      for (let i = 0; i < numLost; i++) {
        healthIcons.push(
          <img
            key={"lost-hearts" + i}
            src={HeartIcon}
            alt="heart"
            style={{ height: "30px", width: "30px", filter: "grayscale(100%)" }}
          />
        );
      }
    } else if (currentHealth > props.currentPlayer.currentTraits.health) {
      const numGained = -1 * props.currentPlayer.healthDmgTaken;

      for (let i = 0; i < numGained; i++) {
        healthIcons.push(
          <img
            key={"extra-hearts" + i}
            src={HeartIcon}
            alt="heart"
            style={{
              height: "30px",
              width: "30px",
              boxShadow: "inset 2px 2px 2px 2px gold",
            }}
          />
        );
      }
    }

    return healthIcons;
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
                    <CardHeader title="Current Player" />
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
                              {props.currentPlayer.owner
                                .toString()
                                .slice(0, 5) + "..."}
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
          <Grid container spacing={1}>
            <Grid item xs={4}>
              <Player
                {...{
                  player: props.currentPlayer,
                  portrait: false,
                  genHash: props.currentChar.genHash,
                }}
              />
            </Grid>
            <Grid item xs={8}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  <Typography
                    variant="body1"
                    align="left"
                    color={getTraitColor(
                      props.currentChar.traits.health,
                      props.currentPlayer.currentTraits.health
                    )}
                  >
                    Health:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  {renderHealth()}
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="body1"
                    align="left"
                    color={getTraitColor(
                      props.currentChar.traits.carry,
                      props.currentPlayer.currentTraits.carry
                    )}
                  >
                    Carrying:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {
                      props.allHeldItems[
                        props.currentGameProps.currentPlayerTurnIndex
                      ].length
                    }
                    /{props.currentPlayer.currentTraits.carry}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="body1"
                    align="left"
                    color={getTraitColor(
                      props.currentChar.traits.defense,
                      props.currentPlayer.currentTraits.defense
                    )}
                  >
                    Defense:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {props.currentPlayer.currentTraits.defense}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="body1"
                    align="left"
                    color={getTraitColor(
                      props.currentChar.traits.hack,
                      props.currentPlayer.currentTraits.hack
                    )}
                  >
                    Vs. Hack:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {props.currentPlayer.currentTraits.hack}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="body1"
                    align="left"
                    color={getTraitColor(
                      props.currentChar.traits.breach,
                      props.currentPlayer.currentTraits.breach
                    )}
                  >
                    Vs. Breach:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {props.currentPlayer.currentTraits.breach}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="body1"
                    align="left"
                    color={getTraitColor(
                      props.currentChar.traits.shoot,
                      props.currentPlayer.currentTraits.shoot
                    )}
                  >
                    Shoot:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {props.currentPlayer.currentTraits.shoot}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography
                    variant="body1"
                    align="left"
                    color={getTraitColor(
                      props.currentChar.traits.melee,
                      props.currentPlayer.currentTraits.melee
                    )}
                  >
                    Melee:
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body1">
                    {props.currentPlayer.currentTraits.melee}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}
