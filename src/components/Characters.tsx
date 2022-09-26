import { Button, Card, Typography } from "@mui/material";
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
      console.log(remoteChars);

      const newChars: CharInterface[] = [];

      remoteChars.forEach((char: any) => {
        newChars.push(char);
      });
      console.log(newChars);
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
    const tx = await props.lobbiesContract_write.enlistForMission(id, { value: ethers.utils.parseEther(".0001") });
    // await tx.wait();
    // setCharsLoaded(false);
  }

  function renderCharData() {
    const charList: ReactNode[] = []
    chars.forEach((char: CharInterface, index) => {
      charList.push(
        <Card key={index + " Player card"}>
          <Typography variant="body1">
            Hash: {char.genHash}
          </Typography>
          <Typography variant="body1">
            Clone: {char.cloneNumber}/{char.maxClones}
          </Typography>
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
          <Button variant="contained" onClick={() => { handleEnlistClick(index) }}>Enlist for Mission</Button>
        </Card>
      )
    })
    return charList;
  }

  return (
    <Box>
      <Button variant="contained" onClick={handleDecantClick}>Buy New Character NFT</Button>
      <Typography variant="body1">
        Owned Characters: {chars.length}
      </Typography>
      <Box>
        {renderCharData()}
      </Box>
    </Box>
  )
}
