import { Card, Typography } from "@mui/material";
import { GameInterface, GameInfoInterface } from "./GamePanel";
import Player, { PlayerInterface } from "./Player";



export default function GameInfo(props: GameInfoInterface) {

  return (
    <Card>
      <Typography variant="h5">
        Game Info
      </Typography>
      <Typography variant="body1">
        Game Number: {props.currentGameNumber}
      </Typography>
      <Card>
        Current Player: {props.currentGame.currentPlayerTurnIndex.toString()}
        <Player {...{ player: props.currentPlayer, portrait: true }} />
        <Typography variant="body1">
          Actions Taken: {props.currentPlayer.actionsTaken}
        </Typography>
      </Card>
    </Card>
  )
}
