import { Button, Card, CardContent, CardHeader, CardMedia, Grid, List, ListItem, Typography } from "@mui/material";
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
        <Card>
          <CardContent>
            <Grid container>
              <Grid item xs={4}>
                <CardMedia
                  component="iframe"
                  width="560"
                  height="315"
                  src="https://www.youtube.com/embed/onhnfBiq1KE"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <List>
          <ListItem>
            <Typography variant="body1" align="left" color="yellow">
              To start: Buy NFT Character
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body1" align="left" color="yellow">
              Click "Start Solo Mission"
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body1" align="left" color="yellow">
              Go to the Games List tab
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body1" align="left" color="yellow">
              Click Load Game
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body1" align="left" color="yellow">
              You should see the game board, and the "Actions" section with drop down menus on the right side.
            </Typography>
          </ListItem>
          <ListItem>
            <Typography variant="body1" align="left" color="yellow">
              Alternately, find your game number from the Games List, and use the control on the bottom right of the Game tab to select that game.
            </Typography>
          </ListItem>
        </List>
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
          Use the "Move" followup to enter a room after breaching or hacking, or to move through two open/breached doors through two discovered rooms.
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
          Rooms with Bug events will trigger, but many events are not implemented fully.
        </Typography>
        <Typography variant="body1" align="left">
          The Medbay should heal you if you "Use Room"
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
