import "dotenv/config";
import {
  Hex,
  createWalletClient,
  http,
  PrivateKeyAccount,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

import { sepolia } from "viem/chains";

export const getStoryConfig = (account: PrivateKeyAccount) => ({
  transport: http(RPC_URL),
  account,
}) as StoryConfig;

export const TOKEN_CONTRACT_ADDRESS = "0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F49";
export const TEST_WALLET_A_ADDRESS = (process.env.TEST_WALLET_A_ADDRESS || "0x") as `0x${string}`;
export const TEST_WALLET_B_ADDRESS = (process.env.TEST_WALLET_B_ADDRESS || "0x") as `0x${string}`;
export const TEST_WALLET_C_ADDRESS = (process.env.TEST_WALLET_C_ADDRESS || "0x") as `0x${string}`;
export const NFT_CONTRACT_ADDRESS = (process.env.NFT_CONTRACT_ADDRESS || "0x") as `0x${string}`;
export const RPC_URL = process.env.RPC_URL || "";
export const LICENSE_MODULE = (process.env.LICENSE_MODULE || "") as `0x${string}`;
export const MINT_FEE_TOKEN = (process.env.MINT_FEE_TOKEN || "") as `0x${string}`;
export const ROYALTY_POLICY = (process.env.ROYALTY_POLICY || "") as `0x${string}`;

export const accountA = privateKeyToAccount((process.env.PRIVATE_KEYS?.split(',')[0] || '0x') as Hex);
export const accountB = privateKeyToAccount((process.env.PRIVATE_KEYS?.split(',')[1] || '0x') as Hex);
export const accountC = privateKeyToAccount((process.env.PRIVATE_KEYS?.split(',')[2] || '0x') as Hex);

const configA: StoryConfig = getStoryConfig(accountA);
const configB: StoryConfig = getStoryConfig(accountB);
const configC: StoryConfig = getStoryConfig(accountC);

export const storyClientA: StoryClient = StoryClient.newClient(configA);
export const storyClientB: StoryClient = StoryClient.newClient(configB);
export const storyClientC: StoryClient = StoryClient.newClient(configC);

export const walletClientA = createWalletClient({
  transport: http(RPC_URL),
  chain: sepolia,
  account: accountA,
});
export const walletClientB = createWalletClient({
  transport: http(RPC_URL),
  chain: sepolia,
  account: accountB,
});
export const walletClientC = createWalletClient({
  transport: http(RPC_URL),
  chain: sepolia,
  account: accountC,
});
