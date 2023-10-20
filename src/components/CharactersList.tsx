import { Button, Card, Grid, Typography } from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import { CharInterface } from "./Board";
import { ItemDataInterface } from "./ItemCard";
import ItemSelector from "./ItemSelector";
import Player, { ArchetypeProps, PlayerInterface } from "./Player";

import { useContractRead, useContractReads, useContractWrite } from "wagmi";
import { charContract, itemsContract } from "../contracts";

import charContractDeployData from "../deployments/BCChars.json";
import { parseEther } from "viem";
import {
  DECANT_COST_IN_ETH,
  MULTI_GAME_COST_IN_ETH,
  SOLO_GAME_COST_IN_ETH,
} from "../constants";

interface CharactersDataInterface {
  address: string;
  setCurrentGameNumber: Function;
  setTabValue: Function;
}

interface SelectedItemsInterface {
  [charId: number]: number[];
}

export default function CharactersList(props: CharactersDataInterface) {
  const [chars, setChars] = useState<CharInterface[]>([]);

  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [items, setItems] = useState<ItemDataInterface[]>([]);

  const [selectedItems, setSelectedItems] = useState<SelectedItemsInterface>(
    {}
  );
  const [clearChoices, setClearChoices] = useState(false);

  // TODO: I think this should be useContractReads, but I get both websockets errors and
  // errs from char being null if I do that.  I think it might be returning results with only one
  // or the other, and then setting the one without a result to null.
  // Might be able to handle with if (data) then if (data[0]) then setChars(data[0])
  useContractRead({
    address: charContract.address,
    abi: charContract.abi,
    functionName: "getAllCharsByOwner",
    args: [props.address],
    watch: true,
    onSettled: (data, error) => {
      if (data) {
        setChars(data as CharInterface[]);
      }
      if (error) {
        console.log("Error getting chars", error);
      }
    },
  });

  useContractRead({
    address: itemsContract.address,
    abi: itemsContract.abi,
    functionName: "getOwnedItems",
    args: [props.address],
    watch: true,
    onSettled: (data, error) => {
      if (data) {
        setItems(data as ItemDataInterface[]);
        setItemsLoaded(true);
      }
      if (error) {
        console.log("Error getting items", error);
      }
    },
  });

  const {
    isLoading: isDecantLoading,
    isSuccess: isDecantSuccess,
    write: decantNewClone,
  } = useContractWrite({
    address: charContract.address,
    abi: charContract.abi,
    functionName: "decantNewClone",
  });

  const {
    isLoading: isEnlistLoading,
    isSuccess: isEnlistSuccess,
    write: enlistChar,
  } = useContractWrite({
    address: charContract.address,
    abi: charContract.abi,
    functionName: "enlistChar",
  });

  const {
    isLoading: isSoloLoading,
    isSuccess: isSoloSuccess,
    write: enlistSolo,
  } = useContractWrite({
    address: charContract.address,
    abi: charContract.abi,
    functionName: "enlistSolo",
  });

  function resetClear() {
    setClearChoices(false);
  }

  const handleGameButtonClick = (id: number) => {
    localStorage.setItem("lastGame", id.toString());
    localStorage.setItem("lastTab", "2");
    const intId = id as number;
    props.setCurrentGameNumber(intId);
    props.setTabValue(2);
  };

  async function handleDecantClick() {
    decantNewClone({ value: parseEther(DECANT_COST_IN_ETH.toString()) });
  }

  async function handleEnlistClick(id: number) {
    enlistChar({
      value: parseEther(MULTI_GAME_COST_IN_ETH.toString()),
      args: [id, selectedItems[id] || []],
    });

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
    enlistSolo({
      value: parseEther(SOLO_GAME_COST_IN_ETH.toString()),
      args: [id, selectedItems[id] || []],
    });

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
              <Button
                variant="contained"
                onClick={() => handleGameButtonClick(char.gameId)}
              >
                Load Game
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
                  <Grid item xs={12}>
                    <Card>
                      <Typography variant="h6">Items</Typography>
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
              {renderEnlistButtons(char)}
            </Grid>
          </Card>
        </Grid>
      );
    });
    return charList;
  }

  function renderDecantButton() {
    return (
      <Button
        disabled={isDecantLoading}
        variant="contained"
        onClick={handleDecantClick}
      >
        {isDecantLoading ? "Sign in Wallet" : "Buy New Character NFT"}
      </Button>
    );
  }

  return (
    <Grid container spacing={1}>
      <Grid item xs={4}>
        <Card>{renderDecantButton()}</Card>
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
