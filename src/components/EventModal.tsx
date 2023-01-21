import { Box, Button, Modal, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { EventDataDisplay, BugEventDisplayData, TileEventDisplayData, MysteryEventDisplayData, ScavEventDisplayData, ShipEventDisplayData } from "./EventData";
import { BCEventType, GameInfoInterface, GameInterface } from "./GamePanel";
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

export default function EventModal(props: GameInfoInterface) {
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    if (props.currentGameProps.eventNumber > 0) {
      handleOpen();
    }
  }, [props.currentGameProps.eventNumber])

  const handleEvent = () => {
    props.gameContract_write.resolveEvent(props.currentGameNumber, 0);
  }

  // TODO: DRY also used in ActionPicker
  function isPlayerTurn(walletAddress: string, charOwner: string) {
    return walletAddress === charOwner;
  };

  function renderResolveButton(playerTurn: boolean) {
    if (playerTurn) {
      return (
        <Button onClick={handleEvent} >Resolve</Button>
      )
    } else {
      return (
        <Button onClick={handleEvent} disabled>Not Your Turn</Button>
      )
    }
  }

  function getEventData(id: number) {
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
    console.log("Didn't find correct event");
    return ({
      name: "Event Missing",
      desc: "Fallback to prevent crash.",
      id: 0
    })
  }

  return (
    <div>
      <Button onClick={handleOpen}>Event</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            {getEventData(props.currentGameProps.eventNumber).name}
          </Typography>
          <Tile
            tile={props.currentTile}
            players={props.players}
            row={props.currentGameProps.eventPosition.row}
            col={props.currentGameProps.eventPosition.col}
            currentGame={props.currentGameProps}
            roomTiles={props.roomTiles}
          />
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            {getEventData(props.currentGameProps.eventNumber).desc}
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            (Temporary) Please close the modal after the event resolve transaction completes.  You may need to refresh the browser.
          </Typography>
          {renderResolveButton(isPlayerTurn(props.playerSignerAddress, props.currentPlayer.owner))}
        </Box>
      </Modal>
    </div>
  )
}
