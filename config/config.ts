import { Hex, http, Address, defineChain, Chain } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";
import { SupportedChainIds } from "@story-protocol/core-sdk/dist/declarations/src/types/config";

export let licensingModuleAddress: Hex;
export let licenseTokenAddress: Hex;
export let nftContractAddress: Hex;
export let royaltyPolicyAddress: Hex;
export let royaltyPolicyLAPAddress: Hex;
export let royaltyApproveAddress: Hex;
export let mockERC20Address: Hex;
export let arbitrationPolicyAddress: Hex;
export let disputeModuleAddress: Hex;
export let ipAssetRegistryAddress: Hex;
export let licenseTemplateAddress: Hex;
export let rpcProviderUrl: string;
export let chainId: number;

chainId = 1516;
rpcProviderUrl = process.env.RPC_PROVIDER_URL as string;
licensingModuleAddress = process.env.LICENSING_MODULE_ADDRESS as Hex;
licenseTokenAddress = process.env.LICENSING_TOKEN_ADDRESS as Hex;
nftContractAddress = process.env.MOCK_ERC721_ADDRESS as Hex;
royaltyPolicyAddress = process.env.SEPOLIA_ROYALTY_POLICY_ADDRESS as Hex;
royaltyPolicyLAPAddress = process.env.ROYALTY_POLICY_LAP_ADDRESS as Hex;
royaltyApproveAddress = process.env.MOCK_ERC20_ADDRESS as Hex;
mockERC20Address = process.env.MOCK_ERC20_ADDRESS as Hex;
arbitrationPolicyAddress = process.env.ARBITRATION_POLICY_ADDRESS as Hex;
disputeModuleAddress = process.env.DISPUTE_MODULE_ADDRESS as Hex;
ipAssetRegistryAddress = process.env.IPASSET_REGISTRY_ADDRESS as Hex;
licenseTemplateAddress = process.env.LICENSE_TEMPLATE_ADDRESS as Hex;

export function chainStringToViemChain(chainId: SupportedChainIds): Chain {
  switch (chainId.toString()) {
    case "1516":
    case "odyssey":
      return odyssey;
    default:
      throw new Error(`chainId ${chainId as string} not supported`);
  }
}

export const privateKeyA = process.env.WALLET_PRIVATE_KEY_A as Hex;
export const privateKeyB = process.env.WALLET_PRIVATE_KEY_B as Hex;
export const privateKeyC = process.env.WALLET_PRIVATE_KEY_C as Hex;

export const accountA = privateKeyToAccount(privateKeyA as Address);
export const accountB = privateKeyToAccount(privateKeyB as Address);
export const accountC = privateKeyToAccount(privateKeyC as Address);

export const configA: StoryConfig = {
  account: accountA,
  transport: http(rpcProviderUrl),
}

export const configB: StoryConfig = {
  account: accountB,
  transport: http(rpcProviderUrl),
}

export const configC: StoryConfig = {
  account: accountC,
  transport: http(rpcProviderUrl),
}

export const clientA = StoryClient.newClient(configA)
export const clientB = StoryClient.newClient(configB)
export const clientC = StoryClient.newClient(configC)

export const odyssey = defineChain({
  id: 15_16,
  name: "odyssey",
  nativeCurrency: { name: "IP", symbol: "IP", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["https://odyssey.storyrpc.io/"],
    },
  },
  blockExplorers: {
    default: {
      name: "Explorer",
      url: "https://odyssey-testnet-explorer.storyscan.xyz/",
    },
  },
  contracts: {
    //TODO: need to confirm the addresses
    multicall3: {
      address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      blockCreated: 5882,
    },
  },
  testnet: true,
});