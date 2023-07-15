import React, { useState } from "react";
import {
  Button,
  styled,
  Typography,
  Grid,
  Card,
  CardContent,
  createTheme,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";

interface ChatWindowProps {
  content: string[];
}

interface StyledChatWindowProps {
  isOpen: boolean;
}

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#333",
    },
    text: {
      primary: "#fff",
    },
  },
});

const StyledChatWindow = styled("div")<StyledChatWindowProps>(
  ({ theme, isOpen }) => ({
    position: "fixed",
    bottom: isOpen ? "0" : `-${theme.spacing(400)}`,
    right: theme.spacing(2),
    width: "300px",
    height: "400px",
    backgroundColor: "#222",
    border: "1px solid #ccc",
    borderRadius: "4px",
    transition: "bottom 0.3s ease",
    zIndex: 1300,
  })
);

const ToggleButton = styled(Button)(({ theme }) => ({
  width: "100%",
  height: theme.spacing(6),
  backgroundColor: "#555",
  borderRadius: "4px 0 0 4px",
  zIndex: 1300,
}));

const ChatContent = styled("div")(({ theme }) => ({
  padding: theme.spacing(1),
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  overflowY: "auto", // Vertical scroll
  overflowX: "hidden", // Hide horizontal scroll
}));

const CustomCard = styled(Card)(({ theme }) => ({
  width: "100%",
  backgroundColor: "red",
  border: `1px solid ${theme.palette.text.primary}`,
}));

const CustomCardContent = styled(CardContent)(({ theme }) => ({
  padding: theme.spacing(1),
}));

const CustomTypography = styled(Typography)(({ theme }) => ({
  margin: 0,
  textAlign: "left",
}));

const OpenButton = styled(Button)(({ theme }) => ({
  position: "fixed",
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  width: theme.spacing(6),
  height: theme.spacing(6),
  borderRadius: "50%",
  zIndex: 1300,
}));

const ChatWindow: React.FC<ChatWindowProps> = ({ content }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleChatWindow = () => {
    setIsOpen((prevState) => !prevState);
  };

  const openChatWindow = () => {
    setIsOpen(true);
  };

  return (
    <>
      {!isOpen && (
        <OpenButton onClick={openChatWindow}>
          <ChatIcon />
        </OpenButton>
      )}
      <StyledChatWindow isOpen={isOpen}>
        <Grid container>
          <Grid item xs={12}>
            <ToggleButton onClick={toggleChatWindow}>
              {isOpen ? <ChatIcon /> : "Chat"}
            </ToggleButton>
          </Grid>
          {isOpen && (
            <Grid item xs={12}>
              <ChatContent>
                {content.map((message, index) => (
                  <CustomCard key={index} variant="outlined">
                    <CustomCardContent>
                      <CustomTypography variant="body1">
                        {message}
                      </CustomTypography>
                    </CustomCardContent>
                  </CustomCard>
                ))}
              </ChatContent>
            </Grid>
          )}
        </Grid>
      </StyledChatWindow>
    </>
  );
};

export default ChatWindow;
