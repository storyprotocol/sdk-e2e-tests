import { Hex, http, Address, Chain, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { SupportedChainIds } from "@story-protocol/core-sdk/dist/declarations/src/types/config";

const TEST_ENV = process.env.TEST_ENV as SupportedChainIds
console.log(TEST_ENV)

export let licenseModuleAddress: Hex;
export let nftContractAddress: Hex;
export let royaltyPolicyAddress: Hex;
export let mintFeeTokenAddress: Hex;
export let rpcProviderUrl: any;

if (TEST_ENV == "sepolia") {
  rpcProviderUrl = http(process.env.SEPOLIA_RPC_PROVIDER_URL);
  licenseModuleAddress = process.env.SEPOLIA_LICENSE_MODULE_ADDRESS as Hex;
  nftContractAddress = process.env.SEPOLIA_NFT_CONTRACT_ADDRESS as Hex;
  royaltyPolicyAddress = process.env.SEPOLIA_ROYALTY_POLICY_ADDRESS as Hex;
  mintFeeTokenAddress = process.env.SEPOLIA_MINT_FEE_TOKEN as Hex;
} else if (TEST_ENV == "storyTestnet") {
  rpcProviderUrl = http(process.env.STORY_RPC_PROVIDER_URL);
  licenseModuleAddress = process.env.STORY_LICENSE_MODULE_ADDRESS as Hex;
  nftContractAddress = process.env.STORY_NFT_CONTRACT_ADDRESS as Hex;
  royaltyPolicyAddress = process.env.STORY_ROYALTY_POLICY_ADDRESS as Hex;
  mintFeeTokenAddress = process.env.STORY_MINT_FEE_TOKEN as Hex;
} else {
  throw new Error(`Unknown TEST_ENV value: ${TEST_ENV}`);
}

export const privateKeyA = process.env.WALLET_PRIVATE_KEY_A as Hex;
export const privateKeyB = process.env.WALLET_PRIVATE_KEY_B as Hex;
export const privateKeyC = process.env.WALLET_PRIVATE_KEY_C as Hex;

export const accountA = privateKeyToAccount(privateKeyA as Address);
export const accountB = privateKeyToAccount(privateKeyB as Address);
export const accountC = privateKeyToAccount(privateKeyC as Address);

export const configA: StoryConfig = {
  account: accountA,
  chainId: TEST_ENV,
  transport: rpcProviderUrl,
}

export const configB: StoryConfig = {
  account: accountB,
  chainId: TEST_ENV,
  transport: rpcProviderUrl,
}

export const configC: StoryConfig = {
  account: accountC,
  chainId: TEST_ENV,
  transport: rpcProviderUrl,
}

export const clientA = StoryClient.newClient(configA)
export const clientB = StoryClient.newClient(configB)
export const clientC = StoryClient.newClient(configC)

export function chainStringToViemChain(chainId: SupportedChainIds): Chain {
  switch (chainId) {
    case "sepolia":
    case "storyTestnet":
      return storyTestnet;
    default:
      throw new Error(`chainId ${chainId as string} not supported`);
  }
}
  
export const storyTestnet = defineChain({
  id: 15_13,
  name: "story-network",
  nativeCurrency: { name: "Ether", symbol: "SEP", decimals: 18 },
  rpcUrls: {
  default: {
    http: ["https://story-network.rpc.caldera.xyz/http"],
    webSocket: ["wss://story-network.rpc.caldera.xyz/ws"],
    }
  },
  blockExplorers: {
    default: { name: "Explorer", url: "https://story-network.explorer.caldera.xyz" },
  },
  contracts: {
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5882,
    },
  },
  testnet: true
});