import { Button, Card, CardMedia, Chip, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system"
import { ethers } from "ethers";
import { ReactNode, useEffect, useState } from "react";
import { CharInterface } from "./Board";
import { ItemDataInterface } from "./ItemCard";
import ItemSelector from "./ItemSelector";
import Player, { ArchetypeProps, PlayerInterface } from "./Player";

interface CharactersDataInterface {
  charContract_read: any, // todo any
  charContract_write: any,
  lobbiesContract_write: any,
  itemsContract_read: any,
  address: string
}

interface SelectedItemsInterface { [charId: number]: number[]; }

// TODO: Rename to CharactersList
export default function CharactersList(props: CharactersDataInterface) {

  const [charsLoaded, setCharsLoaded] = useState(false);
  const [chars, setChars] = useState<CharInterface[]>([]);

  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [items, setItems] = useState<ItemDataInterface[]>([]);

  const [selectedItems, setSelectedItems] = useState<SelectedItemsInterface>({});
  const [clearChoices, setClearChoices] = useState(false);

  useEffect(() => {
    console.log("Start of useEffect in characters");

    async function updateCharsFromChain() {
      const remoteChars = await props.charContract_read.getAllCharsByOwner(props.address);

      const newChars: CharInterface[] = [];

      let newSelectedItems: SelectedItemsInterface = {};

      remoteChars.forEach((char: any) => {
        newChars.push(char);
        newSelectedItems[char.id] = [];
      });
      setChars(newChars);
      setSelectedItems(newSelectedItems);
      setCharsLoaded(true);
    }

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

    if (!charsLoaded) {
      updateCharsFromChain();
    }

  }, [props.address, charsLoaded, props.charContract_read, itemsLoaded, props.itemsContract_read]);

  function resetClear() {
    setClearChoices(false);
  }

  async function handleDecantClick() {
    const tx = await props.charContract_write.decantNewClone({ value: ethers.utils.parseEther(".01") });
    await tx.wait();
    setCharsLoaded(false);
  }

  async function handleEnlistClick(id: number) {
    const tx = await props.charContract_write.enlistChar(id, selectedItems[id], { value: ethers.utils.parseEther(".0001") });
    await tx.wait();
    setCharsLoaded(false);
    setClearChoices(true);
  }

  function renderEnlistButton(char: CharInterface) {
    if (char.inGame) {
      return (
        <Button variant="contained" disabled>Away on Mission</Button>
      )
    } else {
      return (
        <Button variant="contained" onClick={() => { handleEnlistClick(char.id) }}>Enlist for Mission</Button>
      )
    }
  }

  async function handleSoloClick(id: number) {
    console.log(selectedItems)
    console.log("Items sent to game", Array.from(selectedItems[id].values()))
    const tx = await props.charContract_write.enlistSolo(id, selectedItems[id], { value: ethers.utils.parseEther(".0005") });
    await tx.wait();
    setCharsLoaded(false);
    setClearChoices(true);
  }

  function updateItemsForChar(charId: number, itemIds: number[]) {
    let newSelectedItems = { ...selectedItems };
    newSelectedItems[charId] = itemIds;
    setSelectedItems(newSelectedItems);
  }

  function renderSoloButton(char: CharInterface) {
    if (char.inGame) {
      return (
        <Button variant="contained" disabled>Away on Mission</Button>
      )
    } else {
      return (
        <Button variant="contained" onClick={() => { handleSoloClick(char.id) }}>Start Solo Mission</Button>
      )
    }
  }

  function buildPlayerProps(genHash: string) {
    return (
      {
        portrait: true,
        genHash: genHash
      }
    )
  }

  function renderCharData() {
    const charList: ReactNode[] = []
    chars.forEach((char: CharInterface, index) => {
      charList.push(
        <Grid item xs={3} key={index + " Player card"}>
          <Card>
            <Typography variant="body1" align="left">
              UiF DNA:
            </Typography>
            <Typography variant="body1" align="left">
              {char.genHash.slice(2, 34)}
            </Typography>
            <Typography variant="body1" align="left">
              {char.genHash.slice(34, 66)}
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Player {...buildPlayerProps(char.genHash)} />
              </Grid>
              <Grid item xs={6}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Card>
                      <Typography variant="body1">
                        Clone: {char.cloneNumber}/{char.maxClones}
                      </Typography>
                      <Typography variant="body1">
                        Id Number: {char.id.toString()}
                      </Typography>
                      <Typography variant="body1">
                        Traits
                      </Typography>
                      <Typography variant="body1">
                        Health: {char.traits.health}
                      </Typography>
                      <Typography variant="body1">
                        Carry: {char.traits.carry}
                      </Typography>
                      <Typography variant="body1">
                        Defense: {char.traits.defense}
                      </Typography>
                      <Typography variant="body1">
                        Hack: {char.traits.hack}
                      </Typography>
                      <Typography variant="body1">
                        Breach: {char.traits.breach}
                      </Typography>
                      <Typography variant="body1">
                        Shoot: {char.traits.shoot}
                      </Typography>
                      <Typography variant="body1">
                        Melee: {char.traits.melee}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card>
                      <Typography variant="h6">
                        Items
                      </Typography>
                      <Grid container spacing={1}>
                        <ItemSelector
                          charId={parseInt(char.id.toString())}
                          items={items}
                          updateItemsForChar={updateItemsForChar}
                          clearChoices={clearChoices}
                          resetClear={resetClear}
                        />
                      </Grid>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={1}>
                <Grid item xs={6}>
                  {renderEnlistButton(char)}
                </Grid>
                <Grid item xs={6}>
                  {renderSoloButton(char)}
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      )
    })
    return charList;
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={12}>
        <Card>
          <Button variant="contained" onClick={handleDecantClick}>Buy New Character NFT</Button>
          <Typography variant="body1">
            Owned Characters in Barracks: {chars.length}
          </Typography>
          <Typography variant="body1">
            Please retry if joining/starting a mission fails.
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={12}>
        <Grid container spacing={1}>
          {renderCharData()}
        </Grid>
      </Grid>
    </Grid>
  )
}
