import { Grid } from "@mui/material";
import { ReactNode } from "react";
import { GameInfoInterface } from "./GamePanel";
import ItemCard from "./ItemCard";


export default function Inventory(props: GameInfoInterface) {
    const itemCards: ReactNode[] = [];
    const itemList = props.allHeldItems[props.currentGameProps.currentPlayerTurnIndex];
    for (let i = 0; i < itemList.length; i++) {
      itemCards.push(
        <Grid item xs={3} key={"item-card-for-" + itemList[i].genHash}>
          <ItemCard {...itemList[i]}/>
        </Grid>
      )
    }
    return (
      <Grid container spacing={1}>
        {itemCards}
      </Grid>
    )
}
