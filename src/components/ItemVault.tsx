import { Card, Grid, Typography } from "@mui/material";
import React, { ReactNode, useState } from "react";
import ItemCard, { ItemDataInterface } from "./ItemCard";
import { useContractRead } from "wagmi";
import { itemsContract } from "../contracts";

interface ItemVaultDataInterface {
  address: string;
}

// TODO: Rename to CharactersList
export default function ItemVault(props: ItemVaultDataInterface) {
  const [items, setItems] = useState<ItemDataInterface[]>([]);

  useContractRead({
    address: itemsContract.address,
    abi: itemsContract.abi,
    functionName: "getOwnedItems",
    args: [props.address],
    watch: true,
    onSettled: (data) => {
      if (data) {
        setItems(data as ItemDataInterface[]);
      }
    },
  });

  function renderItemCards() {
    const itemCards: ReactNode[] = [];

    for (let i = 0; i < items.length; i++) {
      itemCards.push(
        <Grid item xs={3} key={"item-card-for-" + items[i].genHash}>
          <Card variant="outlined">
            <ItemCard {...items[i]} />
          </Card>
        </Grid>
      );
    }

    return itemCards;
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Card>
          <Typography variant="body1">
            Owned Items Not in Game: {items.length}
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          {renderItemCards()}
        </Grid>
      </Grid>
    </Grid>
  );
}
