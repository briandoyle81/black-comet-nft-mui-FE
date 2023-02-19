import { Button, Card, CardContent, FormControl, Grid, InputLabel, MenuItem, Typography } from "@mui/material";
import { useState } from "react";
import { GameInfoInterface } from "./GamePanel";
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { ethers } from "ethers";

enum Action { HACK=0, BREACH, MOVE, PASS, LOOT, USE_ROOM, USE_ITEM, DROP_ITEMS, PICK_ITEMS } // TODO: Add rest
enum Followthrough { NONE = 0, MOVE }
enum Direction { NORTH = 0, SOUTH, EAST, WEST }
enum PanelState { LIVE=0, WAITING }

export default function ActionPicker(props: GameInfoInterface) {
  const [action, setAction] = useState(Action.PASS);
  const [firstDir, setFirstDir] = useState(Direction.NORTH);
  const [followthrough, setFollowthrough] = useState(Followthrough.NONE);
  const [secondDir, setSecondDir] = useState(Direction.NORTH);
  const [panelState, setPanelState] = useState(PanelState.LIVE);
  const [actionIds, setActionIds] = useState<number[]>([]);

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
    let cost = ethers.utils.parseUnits("0", 'gwei'); // TODO: Hardcoding
    setPanelState(PanelState.WAITING);
    if (action === Action.LOOT) {
      cost = ethers.utils.parseUnits((100 * props.numItems).toString(), 'gwei')
    }
    const actionTx = await props.actionsContract_write.doAction(
      props.currentGameNumber,
      props.currentPlayer.remoteId,
      action,
      followthrough,
      firstDir,
      secondDir,
      actionIds,
      {
        value: cost,
        gasLimit: 4000000 // TODO: Find a more elegant solution here
      }
    );

    if (action === Action.BREACH || Action.HACK) {
      // TODO: Shoot
      // TODO: Roll for egg, etc.
      props.setLastDieRoll("Rolling...");
    } else {
      props.setLastDieRoll("None");
    }

    // Below works for the acting client, but not a hook, so others
    // won't get the update (they do through the events though)
    await actionTx.wait().then(() => {
      // TODO: Set waiting state to prevent action submission
      props.setEventFlipper();
      setPanelState(PanelState.LIVE);
    });
  };

  function isPlayerTurn(walletAddress: string, charOwner: string) {
    // console.log("walletAddress", walletAddress);
    // console.log("charOwner", charOwner);
    return walletAddress === charOwner;
  };

  function renderActionPicker(playerTurn: boolean) {
    if (props.allHeldItems[props.currentGameProps.currentPlayerTurnIndex].length > props.currentChar.traits.carry) {
      return (
        <Card>
          <CardContent>
            <Typography align="left">
              You are carrying too many items.
            </Typography>
            <Typography align="left">
              You must drop some to act.
            </Typography>
          </CardContent>
        </Card>
      )
    }

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
              <MenuItem value={Action.LOOT.toString()}>Loot</MenuItem>
              <MenuItem value={Action.USE_ROOM.toString()}>Use Room</MenuItem>
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
          <Button
            variant="contained"
            onClick={submitAction}
            disabled={panelState == PanelState.LIVE ? false : true}
          >
            Submit
          </Button>
          <Typography variant="body1">
            Input not validated client-side (yet)
          </Typography>
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
        Action Selector
      </Typography>
      {renderActionPicker(isPlayerTurn(props.playerSignerAddress, props.currentPlayer.owner))}

    </Card>
  )
}
