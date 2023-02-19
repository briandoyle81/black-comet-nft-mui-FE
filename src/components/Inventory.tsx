import { Card, Grid, Typography } from "@mui/material";
import { styled } from '@mui/material/styles';
import { ReactNode, useState } from "react";
import { GameInfoInterface } from "./GamePanel";
import ItemCard from "./ItemCard";

const OutlinedCard = styled(Card)(({ theme }) => ({
  outlineColor: 'red',
}));

export default function Inventory(props: GameInfoInterface) {
  const [selected, setSelected] = useState<any>({});

  const handleCardClick = (event: any, cardNumber: number) => {
    if (selected[cardNumber] === true) {
      selected[cardNumber] = undefined;
    } else {
      selected[cardNumber] = true;
    }
    setSelected({ ...selected });
  }

  const itemCards: ReactNode[] = [];
  const itemList = props.allHeldItems[props.currentGameProps.currentPlayerTurnIndex];
  for (let i = 0; i < itemList.length; i++) {
    itemCards.push(
      <Grid item xs={3} key={"item-card-for-" + itemList[i].genHash}>
        {
          selected[i] ?
            <Card variant="outlined" onClick={(e) => { handleCardClick(e, i) }} style={{borderColor: "red", borderWidth: 2}}>
              <ItemCard {...itemList[i]} />
            </Card>
            :
            <Card  variant="outlined" onClick={(e) => { handleCardClick(e, i) }}>
              <ItemCard {...itemList[i]} />
            </Card>
        }
      </Grid>
    )
  }
  return (
    <Card>
      <Typography variant="body1">
        Items Held
      </Typography>
      <Grid container spacing={1}>
        {itemCards}
      </Grid>
    </Card>

  )
}
