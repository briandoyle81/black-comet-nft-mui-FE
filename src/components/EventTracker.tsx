import React from "react";
import { Card, CardHeader, Typography, Grid } from "@mui/material";
import { GameInterface } from "./GamePanel";

interface EventTrackerProps {
  currentGameProps: GameInterface;
}

const EventTracker: React.FC<EventTrackerProps> = ({ currentGameProps }) => {
  return (
    <Card>
      <CardHeader title="Event Tracker" />
      <Grid container spacing={0}>
        <Grid item xs={6}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body1" align="left">
                Bug:
              </Typography>
              <Typography variant="body1" align="left">
                Mystery:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                {currentGameProps.eventTracker.bugEvents.toString()}
              </Typography>
              <Typography variant="body1">
                {currentGameProps.eventTracker.mysteryEvents.toString()}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body1" align="left">
                Scavenger:
              </Typography>
              <Typography variant="body1" align="left">
                Ship:
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body1">
                {currentGameProps.eventTracker.scavEvents.toString()}
              </Typography>
              <Typography variant="body1">
                {currentGameProps.eventTracker.shipEvents.toString()}
              </Typography>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
};

export default EventTracker;
