import { Button, Card, CardMedia, Chip, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { ethers } from "ethers";
import { ReactNode, useEffect, useState } from "react";
import { CharInterface } from "./Board";
import { ItemDataInterface } from "./ItemCard";
import ItemSelector from "./ItemSelector";
import Player, { ArchetypeProps, PlayerInterface } from "./Player";

interface CharactersDataInterface {
  charContract_read: any; // todo any
  charContract_write: any;
  lobbiesContract_write: any;
  itemsContract_read: any;
  address: string;
  setCurrentGameNumber: Function;
  setTabValue: Function;
}

interface SelectedItemsInterface {
  [charId: number]: number[];
}

// TODO: Rename to CharactersList
export default function CharactersList(props: CharactersDataInterface) {
  const [charsLoaded, setCharsLoaded] = useState(false);
  const [chars, setChars] = useState<CharInterface[]>([]);

  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [items, setItems] = useState<ItemDataInterface[]>([]);

  const [selectedItems, setSelectedItems] = useState<SelectedItemsInterface>(
    {}
  );
  const [clearChoices, setClearChoices] = useState(false);

  useEffect(() => {
    console.log("Start of useEffect in characters");

    async function updateCharsFromChain() {
      const remoteChars = await props.charContract_read.getAllCharsByOwner(
        props.address
      );

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
      const remoteChars = await props.itemsContract_read.getOwnedItems(
        props.address
      );

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
  }, [
    props.address,
    charsLoaded,
    props.charContract_read,
    itemsLoaded,
    props.itemsContract_read,
  ]);

  function resetClear() {
    setClearChoices(false);
  }

  async function handleDecantClick() {
    const tx = await props.charContract_write.decantNewClone({
      value: ethers.utils.parseEther(".01"),
    });
    await tx.wait();
    setCharsLoaded(false);
  }

  async function handleEnlistClick(id: number) {
    const tx = await props.charContract_write.enlistChar(
      id,
      selectedItems[id],
      { value: ethers.utils.parseEther(".0001"), gasLimit: 12000000 }
    );
    await tx.wait();
    setCharsLoaded(false);
    setClearChoices(true);
  }

  // TODO:  Chars don't know what game they're in
  // function handleGameButtonClick(id: number) {
  //   // TODO: Magic number
  //   localStorage.setItem("lastGame", id.toString());
  //   localStorage.setItem("lastTab", "2");
  //   const intId = ethers.BigNumber.from(id).toNumber();
  //   props.setCurrentGameNumber(intId);
  //   props.setTabValue(2);
  // }

  async function handleSoloClick(id: number) {
    console.log(selectedItems);
    console.log("Items sent to game", Array.from(selectedItems[id].values()));
    const tx = await props.charContract_write.enlistSolo(
      id,
      selectedItems[id],
      { value: ethers.utils.parseEther(".0005"), gasLimit: 12000000 }
    );
    await tx.wait();
    setCharsLoaded(false);
    setClearChoices(true);
  }

  function updateItemsForChar(charId: number, itemIds: number[]) {
    let newSelectedItems = { ...selectedItems };
    newSelectedItems[charId] = itemIds;
    setSelectedItems(newSelectedItems);
  }

  function buildPlayerProps(genHash: string) {
    return {
      portrait: true,
      genHash: genHash,
    };
  }

  function renderEnlistButtons(char: CharInterface) {
    if (char.inGame) {
      return (
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Button variant="contained" disabled>
                In Game
              </Button>
            </Grid>
          </Grid>
        </Grid>
      );
    } else {
      return (
        <Grid item xs={12}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                variant="contained"
                onClick={() => {
                  handleEnlistClick(char.id);
                }}
              >
                Enlist for Mission
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="contained"
                onClick={() => {
                  handleSoloClick(char.id);
                }}
              >
                Start Solo Mission
              </Button>
            </Grid>
          </Grid>
        </Grid>
      );
    }
  }

  function renderCharData() {
    const charList: ReactNode[] = [];
    chars.forEach((char: CharInterface, index) => {
      charList.push(
        <Grid item xs={3} key={index + " Player card"}>
          <Card>
            <Grid container spacing={2}>
              <Grid item xs={12}>
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
                </Card>
              </Grid>
              <Grid item xs={6}>
                <Player {...buildPlayerProps(char.genHash)} />
              </Grid>
              <Grid item xs={6}>
                <Grid container spacing={1}>
                  <Grid item xs={12}>
                    <Card>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="left">
                            Clone:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {char.cloneNumber}/{char.maxClones}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="left">
                            Id Number:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {char.id.toString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="body1">Traits</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="left">
                            Health:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {char.traits.health}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="left">
                            Carry:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {char.traits.carry}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="left">
                            Defense:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {char.traits.defense}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="left">
                            Hack:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {char.traits.hack}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="left">
                            Breach:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {char.traits.breach}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="left">
                            Shoot:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {char.traits.shoot}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1" align="left">
                            Melee:
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body1">
                            {char.traits.melee}
                          </Typography>
                        </Grid>
                      </Grid>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              {renderEnlistButtons(char)}
            </Grid>
          </Card>
        </Grid>
      );
    });
    return charList;
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <Card>
          <Button variant="contained" onClick={handleDecantClick}>
            Buy New Character NFT
          </Button>
        </Card>
      </Grid>
      <Grid item xs={4}>
        <Card>
          <Typography variant="body1">
            Owned Characters in Barracks: {chars.length}
          </Typography>
        </Card>
      </Grid>
      <Grid item xs={4}>
        <Card>
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
  );
}
