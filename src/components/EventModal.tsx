import { Box, Button, Modal, Typography } from "@mui/material";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { EventDataDisplay, BugEventDisplayData, TileEventDisplayData, MysteryEventDisplayData, ScavEventDisplayData, ShipEventDisplayData } from "./EventData";
import { BCEventType, GameInfoInterface, GameInterface } from "./GamePanel";
import { roomDisplayDataList } from "./RoomTiles";
import Tile, { EmptyTile } from "./Tile";


const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  color: 'white',
  p: 4,
};

enum eventModalState {LIVE=0, WAITING, RESOLVED, NONE}

export default function EventModal(props: GameInfoInterface) {
  const [open, setOpen] = useState(false);
  const [modalState, setModalState] = useState(eventModalState.NONE);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (props.currentGameProps.eventNumber > 0) {
      setModalState(eventModalState.LIVE);
      handleOpen();
    }
  }, [props.currentGameProps.eventNumber]);

  useEffect(() => {
    if (props.eventResolved) {
      setModalState(eventModalState.RESOLVED);
    }
  }, [props.eventResolved]);

  const handleEvent = () => {
    props.gameContract_write.resolveEvent(props.currentGameNumber, 0);
    setModalState(eventModalState.WAITING);
  }

  const handleConfirm = () => {
    setModalState(eventModalState.NONE);
    props.setEventResolved(false);
    handleClose();
  }

  const handleDebugReset = () => {
    // TODO: More elegantly handle cancelled transactions, etc.
    setModalState(eventModalState.LIVE)
  }

  // TODO: DRY also used in ActionPicker
  function isPlayerTurn(walletAddress: string, charOwner: string) {
    return walletAddress === charOwner;
  }

  function renderResolveButton(playerTurn: boolean) {
    if (playerTurn) {
      return (
        <Button variant="contained" onClick={handleEvent} >Resolve</Button>
      )
    } else {
      return (
        <Button variant="contained" onClick={handleEvent} disabled>Not Your Turn</Button>
      )
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
    return ({
      name: roomDisplayDataList[roomId].name,
      desc: roomDisplayDataList[roomId].desc,
      id: 0
    })
  }

  function renderModalTextAndButton() {
    if (modalState === eventModalState.NONE) {
      return (
        <Box>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {getEventData(0, props.currentTile.roomId).desc}
          </Typography>
          <Button onClick={handleClose} >Ok</Button>
        </Box>
      )
    } else if (modalState === eventModalState.WAITING) {
      return (
        <Box>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Waiting for event resolution...
          </Typography>
          <Button variant="contained" onClick={handleDebugReset} >Debug Reshow Resolve Button</Button>
        </Box>
      )
    } else if (modalState === eventModalState.LIVE) {
      return (
        <Box>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {getEventData(props.currentGameProps.eventNumber, props.currentTile.roomId).desc}
          </Typography>
          {renderResolveButton(isPlayerTurn(props.playerSignerAddress, props.currentPlayer.owner))}
        </Box>
      )
    } else if (modalState === eventModalState.RESOLVED) {
      return (
        <Box>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            TODO: PUT WHAT HAPPENED HERE!
          </Typography>
          <Button variant="contained" onClick={handleConfirm} >Ok</Button>
        </Box>
      )
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
            {getEventData(props.currentGameProps.eventNumber, props.currentTile.roomId).name}
          </Typography>
          <Tile
            tile={props.currentTile}
            players={props.players}
            chars={props.chars}
            row={props.currentGameProps.eventPosition.row}
            col={props.currentGameProps.eventPosition.col}
            currentGame={props.currentGameProps}
            roomTiles={props.roomTiles}
            roomsWithItems={props.roomsWithItems}
          />
          {renderModalTextAndButton()}
        </Box>
      </Modal>
    </div>
  )
}
