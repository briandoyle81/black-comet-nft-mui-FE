import charContractDeployData from "../deployments/BCChars.json";
import itemsContractDeployData from "../deployments/BCItems.json";
import gameContractDeployData from "../deployments/BCGames.json";
import actionsContractDeployData from "../deployments/Actions.json";
import utilsContractDeployData from "../deployments/BCUtils.json";
import playersContractDeployData from "../deployments/BCPlayers.json";
import mapsContractDeployData from "../deployments/Maps.json";
import lobbiesContractDeployData from "../deployments/Lobby.json";
import { Abi } from "viem";

export const charContract = {
  address: charContractDeployData.address as `0x${string}`,
  abi: charContractDeployData.abi as Abi,
};

export const itemsContract = {
  address: itemsContractDeployData.address as `0x${string}`,
  abi: itemsContractDeployData.abi as Abi,
};

export const gameContract = {
  address: gameContractDeployData.address as `0x${string}`,
  abi: gameContractDeployData.abi as Abi,
};

export const actionsContract = {
  address: actionsContractDeployData.address as `0x${string}`,
  abi: actionsContractDeployData.abi as Abi,
};

export const utilsContract = {
  address: utilsContractDeployData.address as `0x${string}`,
  abi: utilsContractDeployData.abi as Abi,
};

export const playersContract = {
  address: playersContractDeployData.address as `0x${string}`,
  abi: playersContractDeployData.abi as Abi,
};

export const mapsContract = {
  address: mapsContractDeployData.address as `0x${string}`,
  abi: mapsContractDeployData.abi as Abi,
};

export const lobbiesContract = {
  address: lobbiesContractDeployData.address as `0x${string}`,
  abi: lobbiesContractDeployData.abi as Abi,
};
