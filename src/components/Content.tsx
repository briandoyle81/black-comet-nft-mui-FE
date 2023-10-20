import { Card, Tab, Tabs, Typography } from "@mui/material";
import React, { useState } from "react";
import Box from "@mui/material/Box";

import { useAccount } from "wagmi";

import GameBoard from "./Board";
import CharactersList from "./CharactersList";
import GameList from "./GameList";

import Info from "./Info";
import ItemVault from "./ItemVault";
import { Button } from "@mui/material";
import OnboardingModal from "./OnboardingModal";
import { render } from "@testing-library/react";
import Header from "./Header";

function Content() {
  const { address, isConnected } = useAccount();

  const lastGameString = localStorage.getItem("lastGame");
  let lastGame: number;

  if (lastGameString == null) {
    lastGame = 0;
  } else {
    lastGame = parseInt(lastGameString);
  }

  const [currentGameNumber, setCurrentGameNumber] = useState(lastGame);

  const lastTabString = localStorage.getItem("lastTab");
  let lastTab: number;
  if (lastTabString == null) {
    lastTab = 0;
  } else {
    lastTab = parseInt(lastTabString);
  }
  const [tabValue, setTabValue] = useState(lastTab);

  const [modalOpen, setModalOpen] = useState<boolean>(
    localStorage.getItem("onboarded") === "true" ? false : true
  );

  const handleModalClose = (): void => {
    localStorage.setItem("onboarded", "true");
    setModalOpen(false);
  };

  const handleModalOpen = (): void => {
    localStorage.setItem("onboarded", "false");
    setModalOpen(true);
  };

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }

  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Box>{children}</Box>
          </Box>
        )}
      </div>
    );
  }

  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      "aria-controls": `simple-tabpanel-${index}`,
    };
  }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    localStorage.setItem("lastTab", newValue.toString());
    setTabValue(newValue);
  };

  function renderAppLoading() {
    return (
      <>
        <Typography variant="body1" align="left" color="white">
          Please connect or unlock your wallet. Or wait for it to load. You may
          need to refresh the page. A better connection experience is pending.
        </Typography>
      </>
    );
  }

  function renderAppContent() {
    return (
      <>
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs
              value={tabValue}
              onChange={handleChange}
              aria-label="App Mode Selection"
            >
              <Tab label="Characters" {...a11yProps(0)} />
              <Tab label="Games List" {...a11yProps(1)} />
              <Tab label="Game" {...a11yProps(2)} />
              <Tab label="Lobbies" {...a11yProps(3)} />
              <Tab label="Info" {...a11yProps(4)} />
              <Tab label="Item Vault" {...a11yProps(5)} />
            </Tabs>
          </Box>
          <TabPanel value={tabValue} index={0}>
            <CharactersList
              address={address as string}
              setCurrentGameNumber={setCurrentGameNumber}
              setTabValue={setTabValue}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <GameList
              setCurrentGameNumber={setCurrentGameNumber}
              setTabValue={setTabValue}
              address={address as string}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <GameBoard
              currentGameNumber={currentGameNumber}
              playerSignerAddress={address as string}
              setCurrentGameNumber={setCurrentGameNumber}
              isConnected={isConnected}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <Box>Lobbies (Not implemented)</Box>
          </TabPanel>
          <TabPanel value={tabValue} index={4}>
            <Info />
          </TabPanel>
          <TabPanel value={tabValue} index={5}>
            {/* <ItemVault
              itemsContract_read={itemsContract_read}
              address={playerAddress}
            /> */}
          </TabPanel>
          <Typography>Dev Notes</Typography>
          <Typography>
            UI/UX is temporary. Feedback is not required. I know ;)
          </Typography>
          <Typography>
            Pre-Alpha Test. Bugs abound! Play at your own risk! In-game NFTs
            will be reset regularly. Use a dev wallet!
          </Typography>
        </Card>
      </>
    );
  }

  return (
    <>
      <Header />
      <OnboardingModal open={modalOpen} onClose={handleModalClose} />
      {!isConnected && renderAppLoading()}
      {isConnected && renderAppContent()}
      <Button variant="outlined" color="primary" onClick={handleModalOpen}>
        Re-Open Onboarding
      </Button>
    </>
  );
}

export default Content;
