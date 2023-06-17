import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";

interface logProps {
  logs: string[];
}

export default function Log(props: logProps) {
  return (
    <Box sx={{ height: 150 }}>
      <List>
        {props.logs.map((text, index) => (
          <ListItem key={text} disablePadding>
            {text}
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
