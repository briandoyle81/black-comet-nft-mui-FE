import { Button, Card, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { ReactNode, useState } from "react";
import { Action, Followthrough } from "./ActionPicker";
import { GameInfoInterface } from "./GamePanel";
import ItemCard from "./ItemCard";
import { useContractWrite } from "wagmi";
import { actionsContract } from "../contracts";

export default function Inventory(props: GameInfoInterface) {
  const [selectedCard, setSelectedCard] = useState<any>({});
  const [selectedId, setSelectedId] = useState<number[]>([]);

  const {
    data: dropItemData,
    isSuccess: dropItemIsSuccess,
    write: doAction,
  } = useContractWrite({
    address: actionsContract.address,
    abi: actionsContract.abi,
    functionName: "doAction",
    onSuccess(data) {
      if (data) {
        // props.setEventFlipper();
        setSelectedId([]);
        setSelectedCard({});
      }
    },
  });

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
    doAction({
      args: [
        props.currentGameNumber,
        props.currentPlayer.id,
        Action.DROP_ITEMS,
        Followthrough.NONE,
        0,
        0,
        selectedId,
      ],
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
