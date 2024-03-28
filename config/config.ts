import { Hex, http, Address } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { StoryClient, StoryConfig } from "@story-protocol/core-sdk";

export const licenseModuleAddress = process.env.LICENSE_MODULE_ADDRESS as Hex;
export const nftContractAddress = process.env.MY_NFT_CONTRACT_ADDRESS as Hex;
export const royaltyPolicyAddress = process.env.ROYALTY_POLICY_ADDRESS as Hex;
export const mintFeeToken = process.env.MINT_FEE_TOKEN as Hex;
export const transport = http(process.env.RPC_PROVIDER_URL);
export const privateKeyA = process.env.WALLET_PRIVATE_KEY_A as Hex;
export const privateKeyB = process.env.WALLET_PRIVATE_KEY_B as Hex;
export const privateKeyC = process.env.WALLET_PRIVATE_KEY_C as Hex;

export const accountA = privateKeyToAccount(privateKeyA as Address);
export const accountB = privateKeyToAccount(privateKeyB as Address);
export const accountC = privateKeyToAccount(privateKeyC as Address);

export const configA: StoryConfig = {
  account: accountA,
  transport: transport,
}

export const configB: StoryConfig = {
  account: accountB,
  transport: transport,
}

export const configC: StoryConfig = {
  account: accountC,
  transport: transport,
}

export const clientA = StoryClient.newClient(configA)
export const clientB = StoryClient.newClient(configB)
export const clientC = StoryClient.newClient(configC)