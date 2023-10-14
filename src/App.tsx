import "@rainbow-me/rainbowkit/styles.css";
import "./App.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { configureChains, createConfig, WagmiConfig } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
// import { publicProvider } from "wagmi/providers/public";
// import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

import { ThemeProvider, createTheme } from "@mui/material/styles";

import Content from "./components/Content";

const { chains, publicClient } = configureChains(
  [polygonMumbai],
  [
    // alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_KEY as string }),
    // publicProvider(),
    jsonRpcProvider({
      rpc: (chain) => ({
        http: "https://polygon-mumbai.g.alchemy.com/v2/zp-Tq0B2ca_enpFDdUqiGjJnPD11sxQP",
      }),
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "Black Comet",
  projectId: process.env.REACT_APP_WALLETCONNECT_ID as string,
  chains,
});

const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

const theme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App() {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={chains}>
        <ThemeProvider theme={theme}>
          <div className="App">
            <Content />
          </div>
        </ThemeProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
