import { Button, Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system"




export default function Info() {
  return (
    <Card>
      <CardHeader>
        <Typography variant="h2">
          Info
        </Typography>
      </CardHeader>
      <CardContent>
        <Typography variant="h3" align="left">
          General
        </Typography>
        <Typography variant="body1" align="left" color="red">
          USE A DEV WALLET.  WE ARE NOT RESPONSIBLE FOR ANY LOSSES!!!  EXPECT BUGS AND REGULAR RESETS!
        </Typography>
        <Typography variant="body1" align="left">
          Explore the Black Comet and loot rooms to collect valuable data and NFT items.
        </Typography>
        <Typography variant="body1" align="left">
          Buy a character from the characters tab and click the "Start Solo Mission" button.  Multiplayer is not recommended at this time.
        </Typography>
        <Typography variant="body1" align="left">
          Use the (temporary) actions picker on the right side to move and explore.
        </Typography>
        <Typography variant="body1" align="left">
          Doors can be open, breached, or closed.  The left number is the strength vs. hack.  The right number is strength vs. breach.  Hacking opens the door temporarily, it will close at the end of the round.  Breaching opens it permanently, but allows fire to spread.
        </Typography>
        <Typography variant="body1" align="left">
          Use "Loot" if there are icons in the upper left corner of your current room.
        </Typography>
        <Typography variant="h4" align="left">
          What (Probably) Works
        </Typography>
        <Typography variant="body1" align="left">
          Moving, looting, some events.  Dying if you go into space, or stand in fire (icon in lower left next to vents)
        </Typography>
        <Typography variant="body1" align="left">
          The Medbay should heal you if you "Use Room", and the Engineering Catwalk should teleport you to the room marked as "Main Reactor"
        </Typography>
        <Typography variant="h4" align="left">
          What Doesn't Work
        </Typography>
        <Typography variant="body1" align="left">
          Most consequences for dying, carrying limits, enemy spawns, endgame, nft player and item transfer, combat, dropping items, random events, some room events.
        </Typography>
      </CardContent>
    </Card>
  )
}
