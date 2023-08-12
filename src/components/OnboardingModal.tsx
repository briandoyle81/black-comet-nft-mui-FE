import React, { useEffect } from "react";
import {
  Modal,
  Button,
  Typography,
  Card,
  CardContent,
  CardMedia,
} from "@mui/material";

import Banner from "../assets/img/misc/bc_banner_bright.png";

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, onClose }) => {
  useEffect(() => {
    const onboarded = localStorage.getItem("onboarded");
    if (!onboarded) {
      onClose();
    }
  }, [onClose]);

  const handleOk = (): void => {
    localStorage.setItem("onboarded", "true");
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={handleOk}
      aria-labelledby="onboarding-modal-title"
      aria-describedby="onboarding-modal-description"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Card
        style={{
          maxWidth: "600px",
          outline: "none",
        }}
      >
        <CardContent>
          <Typography id="onboarding-modal-title" variant="h5">
            Welcome to the Black Comet!
          </Typography>
          <CardMedia image={Banner} component="img" />
          <Typography id="onboarding-modal-description" gutterBottom>
            Before you start:
          </Typography>
          <ul>
            <li>
              <Typography>
                You need to use an Ethereum wallet. Consider:{" "}
                <a
                  href="https://www.coinbase.com/wallet"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Coinbase
                </a>{" "}
                or{" "}
                <a
                  href="https://metamask.io/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  MetaMask
                </a>
                .
              </Typography>
            </li>
            <li>
              <Typography>
                You need obtain Mumbai Matic from a faucet. Consider the faucet
                under the developer settings in the Coinbase wallet, or{" "}
                <a
                  href="https://mumbaifaucet.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Alchemy's faucet
                </a>
                .
              </Typography>
            </li>
            <li>
              <Typography>
                The game is currently in alpha testing and is not complete. Do
                not play if you do not understand what this means.
              </Typography>
            </li>
            <li>
              <Typography>
                Game-breaking bugs are present. Because the game is on
                blockchain, this means they are unfixable once they occur.
              </Typography>
            </li>
            <li>
              <Typography>
                Game contracts will be replaced regularly. All games and NFTs
                are temporarily non-transferable and will be lost when this
                happens.
              </Typography>
            </li>
            <li>
              <Typography>
                Mechanics, rules, and balance are not final. Things will change!
              </Typography>
            </li>
          </ul>
          <Button variant="contained" color="primary" onClick={handleOk}>
            Okay, got it!
          </Button>
        </CardContent>
      </Card>
    </Modal>
  );
};

export default OnboardingModal;
