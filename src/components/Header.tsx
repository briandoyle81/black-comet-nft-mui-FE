import React from "react";
import { AppBar, Toolbar, Typography, Box } from "@mui/material";
import { ConnectButton } from "@rainbow-me/rainbowkit";

const Header: React.FC = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box display="flex" flexGrow={1}>
          <Typography variant="h6">Black Comet</Typography>
        </Box>
        <ConnectButton />
      </Toolbar>
    </AppBar>
  );
};

export default Header;
