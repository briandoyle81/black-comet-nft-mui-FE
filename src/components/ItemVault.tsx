import { Button, Card, CardMedia, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system"
import { ethers } from "ethers";
import { ReactNode, useEffect, useState } from "react";
import { CharInterface } from "./Board";
import ItemCard, { ItemDataInterface } from "./ItemCard";
import Player, { ArchetypeProps, PlayerInterface } from "./Player";

interface ItemVaultDataInterface {
  itemsContract_read: any, // todo any
  address: string
}

// TODO: Rename to CharactersList
export default function ItemVault(props: ItemVaultDataInterface) {

  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [items, setItems] = useState<ItemDataInterface[]>([]);

  useEffect(() => {
    console.log("Start of useEffect in Item Vault");

    async function updateVaultFromChain() {
      const remoteChars = await props.itemsContract_read.getOwnedItems(props.address);

      const newItems: ItemDataInterface[] = [];

      remoteChars.forEach((item: any) => {
        newItems.push(item);
      });
      setItems(newItems);
      setItemsLoaded(true);
    }

    if (!itemsLoaded) {
      updateVaultFromChain();
    }

  }, [props.address, itemsLoaded, props.itemsContract_read]);

  function renderItemCards() {
    const itemCards: ReactNode[] = [];

    for (let i = 0; i < items.length; i++) {
    itemCards.push(
      <Grid item xs={3} key={"item-card-for-" + items[i].genHash}>
        <Card  variant="outlined">
          <ItemCard {...items[i]} />
        </Card>
      </Grid>
    )
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
  )
}
