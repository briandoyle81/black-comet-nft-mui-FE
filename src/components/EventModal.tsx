import { Box, Button, Modal, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import {
  BugEventDisplayData,
  TileEventDisplayData,
  MysteryEventDisplayData,
  ScavEventDisplayData,
  ShipEventDisplayData,
} from "./EventData";
import { BCEventType, GameInfoInterface } from "./GamePanel";
import { roomDisplayDataList } from "./RoomTiles";
import Tile from "./Tile";
import { useContractWrite } from "wagmi";
import { gamesContract } from "../contracts";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  color: "white",
  p: 4,
};

enum eventModalState {
  LIVE = 0,
  WAITING,
  RESOLVED,
  NONE,
}

export default function EventModal(props: GameInfoInterface) {
  const [open, setOpen] = useState(false);
  const [modalState, setModalState] = useState(eventModalState.NONE);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const {
    data: resolveEventData,
    isLoading: resolveEventIsLoading,
    isSuccess: resolveEventIsSuccess,
    write: resolveEvent,
  } = useContractWrite({
    address: gamesContract.address,
    abi: gamesContract.abi,
    functionName: "resolveEvent",
  });

  useEffect(() => {
    if (props.eventIsLive && modalState === eventModalState.NONE) {
      setOpen(true);
      setModalState(eventModalState.LIVE);
    }
  }, [props.eventIsLive, modalState]);

  useEffect(() => {
    if (modalState === eventModalState.WAITING && props.eventIsLive === false) {
      setModalState(eventModalState.RESOLVED);
    }
  }, [props.eventIsLive, modalState]);

  const handleEvent = () => {
    resolveEvent({ args: [props.currentGameNumber, 0] });
    setModalState(eventModalState.WAITING);
  };

  const handleConfirm = () => {
    setModalState(eventModalState.NONE);
    handleClose();
  };

  const handleDebugReset = () => {
    // TODO: More elegantly handle cancelled transactions, etc.
    setModalState(eventModalState.LIVE);
  };

  // TODO: DRY also used in ActionPicker
  function isPlayerTurn(walletAddress: string, charOwner: string) {
    return walletAddress === charOwner;
  }

  function renderResolveButton(playerTurn: boolean) {
    if (playerTurn) {
      return (
        <Button variant="contained" onClick={handleEvent}>
          Resolve
        </Button>
      );
    } else {
      return (
        <Button variant="contained" onClick={handleEvent} disabled>
          Not Your Turn
        </Button>
      );
    }
  }

  function getEventData(id: number, roomId: number) {
    switch (props.currentGameProps.eventType) {
      case BCEventType.ROOM:
        return TileEventDisplayData[id];
      case BCEventType.BUG:
        return BugEventDisplayData[id];
      case BCEventType.MYSTERY:
        return MysteryEventDisplayData[id];
      case BCEventType.SCAVENGER:
        return ScavEventDisplayData[id];
      case BCEventType.SHIP_SECURITY:
        return ShipEventDisplayData[id];
    }
    // TODO: throw error
    // console.log("Didn't find correct event");
    return {
      name: roomDisplayDataList[roomId].name,
      desc: roomDisplayDataList[roomId].desc,
      id: 0,
    };
  }

  function convertNewlinesToBreaks(text: string) {
    return text.split("\n").map((item, key) => {
      return (
        <span key={key}>
          {item}
          <br />
        </span>
      );
    });
  }

  function renderModalTextAndButton() {
    if (modalState === eventModalState.NONE) {
      return (
        <Box>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {getEventData(0, props.currentTile.roomId).desc}
          </Typography>
          <Button onClick={handleClose}>Ok</Button>
        </Box>
      );
    } else if (modalState === eventModalState.WAITING) {
      return (
        <Box>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Waiting for event resolution...
          </Typography>
          <Button variant="contained" onClick={handleDebugReset}>
            Debug Reshow Resolve Button
          </Button>
        </Box>
      );
    } else if (modalState === eventModalState.LIVE) {
      return (
        <Box>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {convertNewlinesToBreaks(
              getEventData(
                props.currentGameProps.eventNumber,
                props.currentTile.roomId
              ).desc
            )}
          </Typography>
          {renderResolveButton(
            isPlayerTurn(props.playerSignerAddress, props.currentPlayer.owner)
          )}
        </Box>
      );
    } else if (modalState === eventModalState.RESOLVED) {
      return (
        <Box>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {props.logs[props.logs.length - 1]}
          </Typography>
          <Button variant="contained" onClick={handleConfirm}>
            Ok
          </Button>
        </Box>
      );
    } else {
      console.log("Error, modal in a bad enum state");
    }
  }

  return (
    <div>
      <Button onClick={handleOpen}>Zoom to Room</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {
              getEventData(
                props.currentGameProps.eventNumber,
                props.currentTile.roomId
              ).name
            }
          </Typography>
          <Tile
            tile={props.currentTile}
            players={props.players}
            chars={props.chars}
            row={props.currentGameProps.eventPosition.row}
            col={props.currentGameProps.eventPosition.col}
            currentGame={props.currentGameProps}
            denizens={props.denizens}
            roomTiles={props.roomTiles}
            roomsWithItems={props.roomsWithItems}
          />
          {renderModalTextAndButton()}
        </Box>
      </Modal>
    </div>
  );
}
