import {
  Button,
  Card,
  CardContent,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { DenizenInterface, GameInfoInterface } from "./GamePanel";
import Select, { SelectChangeEvent } from "@mui/material/Select";

import { useContractWrite } from "wagmi";
import { actionsContract } from "../contracts";
import { parseUnits } from "viem";

export enum Action {
  HACK = 0,
  BREACH,
  MOVE,
  PASS,
  LOOT,
  USE_ROOM,
  USE_ITEM,
  DROP_ITEMS,
  PICK_ITEMS,
  LEAVE_GAME,
  MELEE_ATTACK,
  SHOOT_ATTACK,
}

export const ActionString = {
  0: "HACK",
  1: "BREACH",
  2: "MOVE",
  3: "PASS",
  4: "LOOT",
  5: "USE_ROOM",
  6: "USE_ITEM",
  7: "DROP_ITEMS",
  8: "PICK_ITEMS",
  9: "LEAVE_GAME",
  10: "MELEE_ATTACK",
  11: "SHOOT_ATTACK",
};

export enum Followthrough {
  NONE = 0,
  MOVE,
}
enum Direction {
  NORTH = 0,
  SOUTH,
  EAST,
  WEST,
}
enum PanelState {
  LIVE = 0,
  WAITING,
}

export default function ActionPicker(props: GameInfoInterface) {
  const [action, setAction] = useState(Action.PASS);
  const [firstDir, setFirstDir] = useState(Direction.NORTH);
  const [followthrough, setFollowthrough] = useState(Followthrough.NONE);
  const [secondDir, setSecondDir] = useState(Direction.NORTH);
  const [panelState, setPanelState] = useState(PanelState.LIVE);
  const [denizenTarget, setDenizenTarget] = useState(0);

  const {
    data: actionData,
    isLoading: actionIsLoading,
    isSuccess: actionIsSuccess,
    write: doAction,
  } = useContractWrite({
    address: actionsContract.address,
    abi: actionsContract.abi,
    functionName: "doAction",
    onSuccess(data) {
      // I'm doing this because onSettled says it's triggered on send, not on success
      if (data) {
        setPanelState(PanelState.LIVE);
      }
    },
  });

  const handleTarget = (event: SelectChangeEvent) => {
    const targetString = event.target.value as string;
    const target = parseInt(targetString);
    setDenizenTarget(target);
  };

  const handleAction = (event: SelectChangeEvent) => {
    const act = event.target.value as string;
    setAction(+act); // TODO: What is this plus for???
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
    let cost = parseUnits("0", 9); // TODO: Hardcoding, price in gwei
    let actionIds: number[] = [];
    setPanelState(PanelState.WAITING);
    if (action === Action.LOOT) {
      cost = parseUnits((100 * props.numItems).toString(), 9); // TODO: Hardcoding, price in gwei
    }
    if (action === Action.PICK_ITEMS) {
      for (let worldItem of props.gameWorldItems) {
        if (
          worldItem.position.row === props.currentPlayer.position.row &&
          worldItem.position.col === props.currentPlayer.position.col
        ) {
          actionIds.push(worldItem.id);
        }
      }
    }
    if (action === Action.MELEE_ATTACK || action === Action.SHOOT_ATTACK) {
      actionIds.push(denizenTarget);
      console.log(actionIds);
    }

    doAction({
      args: [
        props.currentGameNumber,
        props.currentPlayer.id,
        action,
        followthrough,
        firstDir,
        secondDir,
        actionIds,
      ],
      value: cost,
      gas: BigInt(4000000), // TODO: Find a more elegant solution here
      // What is likely happening is that for random numbers
      // the client side simulation picks a cheaper outcome
      // than what actually happens onchain
    });

    if (action === Action.BREACH || Action.HACK) {
      // TODO: Shoot
      // TODO: Roll for egg, etc.
      props.setLastDieRoll("Rolling...");
    } else {
      props.setLastDieRoll("None");
    }
  };

  function isPlayerTurn(walletAddress: string, charOwner: string) {
    // console.log("walletAddress", walletAddress);
    // console.log("charOwner", charOwner);
    return walletAddress === charOwner;
  }

  function renderActionPicker(playerTurn: boolean) {
    if (
      props.allHeldItems[props.currentGameProps.currentPlayerTurnIndex].length >
      props.currentPlayer.currentTraits.carry
    ) {
      return (
        <Card>
          <CardContent>
            <Typography align="left">
              You are carrying too many items.
            </Typography>
            <Typography align="left">You must drop some to act.</Typography>
          </CardContent>
        </Card>
      );
    }

    function setSecondaryDD() {
      if (
        action == Action.LEAVE_GAME ||
        action == Action.LOOT ||
        action == Action.PASS ||
        action == Action.PICK_ITEMS ||
        action == Action.USE_ROOM ||
        action == Action.MELEE_ATTACK ||
        action == Action.SHOOT_ATTACK
      ) {
        return true;
      }

      return false;
    }

    function getDenizenTargets() {
      if (!props.denizens) {
        return [];
      }
      return props.denizens
        .filter((denizen: DenizenInterface) => {
          if (denizen.healthRemaining.toString() === "0") {
            return false;
          }
          return true;
        })
        .map((denizen: DenizenInterface) => {
          return (
            <MenuItem
              value={parseInt(denizen.id.toString())}
              key={denizen.id.toString() + "-denizen-target"}
            >
              {denizen.id.toString()}
            </MenuItem>
          );
        });
    }

    function renderDenizenField() {
      if (action == Action.MELEE_ATTACK || action == Action.SHOOT_ATTACK) {
        return (
          <FormControl fullWidth>
            <InputLabel id="denizen-target-label">Denizen Target</InputLabel>
            <Select
              labelId="denizen-target-label"
              id="denizen-target-select"
              value={denizenTarget.toString()}
              label="DenizenTarget"
              onChange={handleTarget}
            >
              {getDenizenTargets()}
            </Select>
          </FormControl>
        );
      }

      return <></>;
    }

    return playerTurn && !props.currentGameProps.denizenTurn ? (
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
              <MenuItem value={Action.PICK_ITEMS.toString()}>
                Pick Up Items
              </MenuItem>
              <MenuItem value={Action.LEAVE_GAME.toString()}>
                Leave Game
              </MenuItem>
              <MenuItem value={Action.MELEE_ATTACK.toString()}>
                Melee Attack
              </MenuItem>
              <MenuItem value={Action.SHOOT_ATTACK.toString()}>
                Shoot Attack
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          {!setSecondaryDD() && (
            <FormControl fullWidth>
              <InputLabel id="firstDir-label">Direction</InputLabel>
              <Select
                labelId="firstDir-label"
                id="firstDir-select"
                value={firstDir.toString()}
                label="Direction"
                onChange={handleFirstDir}
                disabled={setSecondaryDD()}
              >
                <MenuItem value={Direction.NORTH.toString()}>North</MenuItem>
                <MenuItem value={Direction.SOUTH.toString()}>South</MenuItem>
                <MenuItem value={Direction.EAST.toString()}>East</MenuItem>
                <MenuItem value={Direction.WEST.toString()}>West</MenuItem>
              </Select>
            </FormControl>
          )}
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
              disabled={setSecondaryDD()}
            >
              <MenuItem value={Followthrough.NONE.toString()}>None</MenuItem>
              <MenuItem value={Followthrough.MOVE.toString()}>Move</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          {!setSecondaryDD() && (
            <FormControl fullWidth>
              <InputLabel id="secondDir-label">Direction</InputLabel>
              <Select
                labelId="secondDir-label"
                id="secondDir-select"
                value={secondDir.toString()}
                label="Direction"
                onChange={handleSecondDir}
                disabled={setSecondaryDD()}
              >
                <MenuItem value={Direction.NORTH.toString()}>North</MenuItem>
                <MenuItem value={Direction.SOUTH.toString()}>South</MenuItem>
                <MenuItem value={Direction.EAST.toString()}>East</MenuItem>
                <MenuItem value={Direction.WEST.toString()}>West</MenuItem>
              </Select>
            </FormControl>
          )}
        </Grid>
        <Grid item xs={12}>
          {renderDenizenField()}
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={submitAction}
            disabled={
              panelState == PanelState.LIVE &&
              !actionIsLoading &&
              !props.eventIsLive
                ? false
                : true
            }
          >
            Submit
          </Button>
          <Typography variant="body1">
            Input not validated client-side (yet)
          </Typography>
        </Grid>
      </Grid>
    ) : (
      <Typography variant="body1">Not your turn or player</Typography>
    );
  }

  return (
    <Card>
      <Typography variant="body1">Action Selector</Typography>
      {renderActionPicker(
        isPlayerTurn(props.playerSignerAddress, props.currentPlayer.owner)
      )}
    </Card>
  );
}
