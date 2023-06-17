import { Button, Card, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { ReactNode, useState } from "react";
import { Action, Followthrough } from "./ActionPicker";
import { GameInfoInterface } from "./GamePanel";
import ItemCard from "./ItemCard";

export default function Inventory(props: GameInfoInterface) {
  const [selectedCard, setSelectedCard] = useState<any>({});
  const [selectedId, setSelectedId] = useState<number[]>([]);

  const handleCardClick = (event: any, cardNumber: number, id: number) => {
    if (selectedCard[cardNumber] === true) {
      selectedCard[cardNumber] = undefined;
      const index = selectedId.indexOf(id, 0);
      if (index > -1) {
        selectedId.splice(index, 1);
      }
    } else {
      selectedCard[cardNumber] = true;
      selectedId.push(id);
    }
    setSelectedCard({ ...selectedCard });
    setSelectedId([...selectedId]);

    console.log(selectedId);
  };

  const submitDrop = async () => {
    const dropTx = await props.actionsContract_write.doAction(
      props.currentGameNumber,
      props.currentPlayer.remoteId,
      Action.DROP_ITEMS,
      Followthrough.NONE,
      0,
      0,
      selectedId
    );

    // Below works for the acting client, but not a hook, so others
    // won't get the update (they do through the events though)
    await dropTx.wait().then(() => {
      // TODO: Set waiting state to prevent action submission
      props.setEventFlipper();
      setSelectedId([]);
      setSelectedCard({});
    });
  };

  const itemCards: ReactNode[] = [];
  const itemList =
    props.allHeldItems[props.currentGameProps.currentPlayerTurnIndex];
  // console.log(props.allHeldItems);
  for (let i = 0; i < itemList.length; i++) {
    itemCards.push(
      <Grid item xs={3} key={"item-card-for-" + itemList[i].genHash}>
        {selectedCard[i] ? (
          <Card
            variant="outlined"
            onClick={(e) => {
              handleCardClick(e, i, itemList[i].id);
            }}
            style={{ borderColor: "red", borderWidth: 2 }}
          >
            <ItemCard {...itemList[i]} />
          </Card>
        ) : (
          <Card
            variant="outlined"
            onClick={(e) => {
              handleCardClick(e, i, itemList[i].id);
            }}
          >
            <ItemCard {...itemList[i]} />
          </Card>
        )}
      </Grid>
    );
  }
  return (
    <Card>
      <Grid container>
        <Grid item xs={6}>
          <Typography variant="body1" align="left">
            Inventory
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Box alignContent="right">
            <Button
              disabled={selectedId.length > 0 ? false : true}
              onClick={submitDrop}
            >
              Drop Selected
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={1}>
            {itemCards}
          </Grid>
        </Grid>
      </Grid>
    </Card>
  );
}
