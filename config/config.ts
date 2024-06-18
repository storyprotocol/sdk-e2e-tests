import { Hex, http, Address, Chain, defineChain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { SupportedChainIds } from "@story-protocol/core-sdk/dist/declarations/src/types/config";

const TEST_ENV = process.env.TEST_ENV as SupportedChainIds;

export let licensingModuleAddress: Hex;
export let licenseTokenAddress: Hex;
export let nftContractAddress: Hex;
export let royaltyPolicyAddress: Hex;
export let royaltyPolicyLAPAddress: Hex;
export let royaltyApproveAddress: Hex;
export let mintingFeeTokenAddress: Hex;
export let arbitrationPolicyAddress: Hex;
export let disputeModuleAddress: Hex;
export let ipAssetRegistryAddress: Hex;
export let rpcProviderUrl: string;
export let chainId: number;

if (String(TEST_ENV) === "sepolia") {
  chainId = 11155111;
  rpcProviderUrl = process.env.SEPOLIA_RPC_PROVIDER_URL as string;
  licensingModuleAddress = process.env.SEPOLIA_LICENSING_MODULE_ADDRESS as Hex;
  licenseTokenAddress = process.env.SEPOLIA_LICENSE_TOKEN_ADDRESS as Hex;
  nftContractAddress = process.env.SEPOLIA_MOCK_ERC721_ADDRESS as Hex;
  royaltyPolicyAddress = process.env.SEPOLIA_ROYALTY_POLICY_ADDRESS as Hex;
  royaltyPolicyLAPAddress = process.env.SEPOLIA_ROYALTY_POLICY_LAP_ADDRESS as Hex;
  royaltyApproveAddress = process.env.SEPOLIA_ROYALTY_ERC20 as Hex;
  mintingFeeTokenAddress = process.env.SEPOLIA_MINTING_FEE_TOKEN as Hex;
  arbitrationPolicyAddress = process.env.SEPOLIA_ARBITRATION_POLICY_ADDRESS as Hex;
  disputeModuleAddress = process.env.SEPOLIA_DISPUTE_MODULE_ADDRESS as Hex;
  ipAssetRegistryAddress = process.env.SEPOLIA_IPASSET_REGISTRY_ADDRESS as Hex;
} else if (String(TEST_ENV) === "storyTestnet") {
  rpcProviderUrl = process.env.STORY_RPC_PROVIDER_URL as string;
  licensingModuleAddress = process.env.STORY_LICENSING_MODULE_ADDRESS as Hex;
  nftContractAddress = process.env.STORY_MOCK_ERC721_ADDRESS as Hex;
  royaltyPolicyAddress = process.env.STORY_ROYALTY_POLICY_ADDRESS as Hex;
  royaltyPolicyLAPAddress = process.env.STORY_ROYALTY_POLICY_LAP_ADDRESS as Hex;
  royaltyApproveAddress = process.env.STORY_ROYALTY_ERC20 as Hex;
  mintingFeeTokenAddress = process.env.STORY_MINTING_FEE_TOKEN as Hex;
  arbitrationPolicyAddress = process.env.STORY_ARBITRATION_POLICY_ADDRESS as Hex;
  ipAssetRegistryAddress = process.env.STORY_IPASSET_REGISTRY_ADDRESS as Hex;
  disputeModuleAddress = process.env.STORY_DISPUTE_MODULE_ADDRESS as Hex;
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
  transport: http(rpcProviderUrl),
}

export const configB: StoryConfig = {
  account: accountB,
  chainId: TEST_ENV,
  transport: http(rpcProviderUrl),
}

export const configC: StoryConfig = {
  account: accountC,
  chainId: TEST_ENV,
  transport: http(rpcProviderUrl),
}

export const clientA = StoryClient.newClient(configA)
export const clientB = StoryClient.newClient(configB)
export const clientC = StoryClient.newClient(configC)

export function chainStringToViemChain(chainId: SupportedChainIds): Chain {
  switch (chainId) {
    case "sepolia":
    // case "storyTestnet":
    //   return storyTestnet;
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