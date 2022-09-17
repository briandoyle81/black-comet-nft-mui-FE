import { Button, Card, FormControl, Grid, InputLabel, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { GameInfoInterface } from "./GamePanel";
import Select, { SelectChangeEvent } from '@mui/material/Select';

enum Action { HACK=0, BREACH, MOVE, PASS } // TODO: Add rest
enum Followthrough { NONE = 0, MOVE }
enum Direction { NORTH=0, SOUTH, EAST, WEST}

export default function ActionPicker(props: GameInfoInterface) {
  const [action, setAction] = useState(Action.PASS);
  const [firstDir, setFirstDir] = useState(Direction.NORTH);
  const [followthrough, setFollowthrough] = useState(Followthrough.NONE);
  const [secondDir, setSecondDir] = useState(Direction.NORTH);

  const handleAction = (event: SelectChangeEvent) => {
    const act = event.target.value as string;
    setAction(+act);
  };

  const handleFirstDir = (event: SelectChangeEvent) => {
    const firstDir = event.target.value as string;
    setFirstDir(+firstDir);
  };

  const handleFollowthrough = (event: SelectChangeEvent) => {
    const followthrough = event.target.value as string;
    setFollowthrough(+followthrough);
  };

  const handleSecondDir = (event: SelectChangeEvent) => {
    const secondDir = event.target.value as string;
    setSecondDir(+secondDir);
  };

  const submitAction = async () => {
    const actionTx = await props.gameContract_write.doAction(
      props.currentGameNumber,
      props.currentPlayer.remoteId,
      action,
      followthrough,
      firstDir,
      secondDir
    );

    await actionTx.wait();
    props.updateBoardFromChain();
    props.updateDoorsFromChain();
    props.updateRemotePlayers();
  };

  function isPlayerTurn(walletAddress: string, charOwner: string) {
    // console.log("walletAddress", walletAddress);
    // console.log("charOwner", charOwner);
    return walletAddress === charOwner;
  };

  function renderActionPicker(playerTurn: boolean) {
    return (playerTurn ?
      <Grid container spacing={1}>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="action-label">Action</InputLabel>
            <Select
              labelId="action-label"
              id="action-select"
              value={action.toString()}
              label="Action"
              onChange={handleAction}
            >
              <MenuItem value={Action.HACK.toString()}>Hack</MenuItem>
              <MenuItem value={Action.BREACH.toString()}>Breach</MenuItem>
              <MenuItem value={Action.MOVE.toString()}>Move</MenuItem>
              <MenuItem value={Action.PASS.toString()}>Pass</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="firstDir-label">Direction</InputLabel>
            <Select
              labelId="firstDir-label"
              id="firstDir-select"
              value={firstDir.toString()}
              label="Direction"
              onChange={handleFirstDir}
            >
              <MenuItem value={Direction.NORTH.toString()}>North</MenuItem>
              <MenuItem value={Direction.SOUTH.toString()}>South</MenuItem>
              <MenuItem value={Direction.EAST.toString()}>East</MenuItem>
              <MenuItem value={Direction.WEST.toString()}>West</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="followthrough-label">Followthrough</InputLabel>
            <Select
              labelId="followthrough-label"
              id="followthrough-select"
              value={followthrough.toString()}
              label="Direction"
              onChange={handleFollowthrough}
            >
              <MenuItem value={Followthrough.NONE.toString()}>None</MenuItem>
              <MenuItem value={Followthrough.MOVE.toString()}>Move</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl fullWidth>
            <InputLabel id="secondDir-label">Direction</InputLabel>
            <Select
              labelId="secondDir-label"
              id="secondDir-select"
              value={secondDir.toString()}
              label="Direction"
              onChange={handleSecondDir}
            >
              <MenuItem value={Direction.NORTH.toString()}>North</MenuItem>
              <MenuItem value={Direction.SOUTH.toString()}>South</MenuItem>
              <MenuItem value={Direction.EAST.toString()}>East</MenuItem>
              <MenuItem value={Direction.WEST.toString()}>West</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" onClick={submitAction}>Submit</Button>
        </Grid>
      </Grid>
      :
      <Typography variant="body1">
        Not your turn or player
      </Typography>
    )
  }

  return (
    <Card>
      <Typography variant="body1">
        Actions
      </Typography>
      {renderActionPicker(isPlayerTurn(props.playerSignerAddress, props.currentPlayer.owner))}
      <Typography variant="body1">
        Reject failed transactions
      </Typography>
      <Typography variant="body1">
        Input not validated client-side (yet)
      </Typography>
    </Card>
  )
}
