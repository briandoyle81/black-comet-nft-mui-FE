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
        Current Player: {props.currentGameProps.currentPlayerTurnIndex.toString()}
        <Player {...{ player: props.currentPlayer, portrait: true }} />
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
        <Typography variant="body1">
          Health Remaining: {props.currentPlayer.healthDmgTaken.toString()}
        </Typography>
      </Card>
    </Card>
  )
}
