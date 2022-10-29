import { Button, Card, Grid, Typography } from "@mui/material";
import { Box } from "@mui/system"
import { ethers } from "ethers";
import { ReactNode, useEffect, useState } from "react";
import { CharInterface } from "./Board";


interface CharactersDataInterface {
  charContract_read: any, // todo any
  charContract_write: any,
  lobbiesContract_write: any,
  address: string
}

export default function Characters(props: CharactersDataInterface) {

  const [charsLoaded, setCharsLoaded] = useState(false);
  const [chars, setChars] = useState<CharInterface[]>([]);

  useEffect(() => {
    console.log("Start of useEffect in characters");

    async function updateCharsFromChain() {
      const remoteChars = await props.charContract_read.getAllCharsByOwner(props.address);

      const newChars: CharInterface[] = [];

      remoteChars.forEach((char: any) => {
        newChars.push(char);
      });
      setChars(newChars);
      setCharsLoaded(true);
    }

    if (!charsLoaded) {
      updateCharsFromChain();
    }

  }, [props.address, charsLoaded, props.charContract_read]);

  async function handleDecantClick() {
    const tx = await props.charContract_write.decantNewClone({ value: ethers.utils.parseEther(".01") });
    await tx.wait();
    setCharsLoaded(false);
  }

  async function handleEnlistClick(id: number) {
    const tx = await props.charContract_write.enlistChar(id, { value: ethers.utils.parseEther(".0001") });
    await tx.wait();
    setCharsLoaded(false);
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

  function renderCharData() {
    const charList: ReactNode[] = []
    chars.forEach((char: CharInterface, index) => {
      charList.push(
        <Grid item xs={3} key={index + " Player card"}>
          <Card>
            <Typography variant="body1">
              Hash:
            </Typography>
            <Typography variant="body1">
              {char.genHash.slice(2, 34)}
            </Typography>
            <Typography variant="body1">
              {char.genHash.slice(34, 66)}
            </Typography>
            <Typography variant="body1">
              Clone: {char.cloneNumber}/{char.maxClones}
            </Typography>
            <Typography variant="body1">
              Id Number: {char.id.toString()}
            </Typography>
            <Grid container spacing={1}>
              <Grid item xs={12}>
                <Card>
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
            </Grid>
            <Grid item xs={12}>
              {renderEnlistButton(char)}
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
