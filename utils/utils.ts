import { http, Hex } from "viem";
import { PrivateKeyAccount } from 'viem/accounts';
import type { StoryConfig } from '@story-protocol/core-sdk';
import { sepolia } from 'viem/chains';
import {
  walletClientA,
  walletClientB,
  walletClientC,
  accountA,
  accountB,
  accountC,
  storyClientA,
  storyClientB,
  storyClientC,
  TEST_WALLET_A_ADDRESS,
  TEST_WALLET_B_ADDRESS,
  TEST_WALLET_C_ADDRESS,
  NFT_CONTRACT_ADDRESS,
  MINT_FEE_TOKEN,
  ROYALTY_POLICY,
  LICENSE_MODULE,
  RPC_URL,
} from '../config/config';

export type Who = 'A' | 'B' | 'C';

export async function mintNFT(who: Who) {
  let client = walletClientA;
  let account = accountA;
  if (who === 'B') {
    client = walletClientB;
    account = accountB;
  }
  if (who === 'C') {
    client = walletClientC;
    account = accountC;
  }
  const hash = await client.writeContract({
    account,
    address: (NFT_CONTRACT_ADDRESS || '0x') as `0x${string}`,
    chain: sepolia,
    abi: [],
    functionName: 'mint' as never,
    args: [],
  });

  console.log('mintNFT', hash);
  return '123';
}

function getStoryClient(who?: Who) {
  let storyClient = storyClientA;
  if (who === 'B') storyClient = storyClientB;
  if (who === 'C') storyClient = storyClientC;
  return storyClient;
}

function getReceiverAddress(receiver?: Who) {
  let receiverAddress = TEST_WALLET_A_ADDRESS;
  if (receiver === 'B') receiverAddress = TEST_WALLET_B_ADDRESS;
  if (receiver === 'C') receiverAddress = TEST_WALLET_C_ADDRESS;
  return receiverAddress;
}

export function sleep(second: number) {
  return new Promise((resolve) => setTimeout(resolve, second * 1000));
}

export const registerRootIp = async (tokenId: string, who: Who = 'A') => {
  const storyClient = getStoryClient(who);
  const response = await storyClient.ipAsset.registerRootIp({
    tokenContractAddress: NFT_CONTRACT_ADDRESS,
    tokenId,
    txOptions: {
      waitForTransaction: true,
    },
  });
  console.log(`${who} registered ip for NFT id ${tokenId}: `, response);
  return response.ipId;
};

export const registerIpWithExistingPolicy = async (tokenId: string, policyId: string, who: Who = 'A') => {
  const storyClient = getStoryClient(who);
  const response = await storyClient.ipAsset.registerRootIp({
    policyId,
    tokenContractAddress: NFT_CONTRACT_ADDRESS,
    tokenId,
    txOptions: {
      waitForTransaction: true,
    },
  });
  console.log(`${who}registered ip for NFT id ${tokenId} with policy${policyId}: `, response);

  return response.ipId;
};

export const registerSocialRemixPolicy = async () => {
  const response = await storyClientA.policy.registerPILPolicy({
    transferable: true,
    attribution: true,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    txOptions: {
      waitForTransaction: true,
    },
  });
  console.log('registerSocialRemixPolicy', response);
  return response.policyId;
};

export const registerSocialRemixPolicy2 = async () => {
  const response = await storyClientA.policy.registerPILPolicy({
    transferable: true,
    attribution: true,
    derivativesAllowed: true,
    derivativesAttribution: false,
    derivativesApproval: false,
    derivativesReciprocal: true,
    txOptions: {
      waitForTransaction: true,
    },
  });
  console.log('registerSocialRemixPolicy2', response);
  return response.policyId;
};

export const registerSocialRemixPolicy3 = async () => {
  const response = await storyClientA.policy.registerPILPolicy({
    transferable: true,
    attribution: true,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: false,
    txOptions: {
      waitForTransaction: true,
    },
  });
  console.log('registerSocialRemixPolicy3', response);
  return response.policyId;
};

export const registerCommercialUsePolicy = async () => {
  const response = await storyClientA.policy.registerPILPolicy({
    transferable: true,
    mintingFeeToken: MINT_FEE_TOKEN,
    mintingFee: '1000000000000000000',
    royaltyPolicy: ROYALTY_POLICY,
    commercialRevShare: 100,
    attribution: true,
    commercialUse: true,
    commercialAttribution: true,
    derivativesAllowed: true,
    derivativesReciprocal: true,
    txOptions: {
      waitForTransaction: true,
    },
  });

  console.log('register Commercial Use Policy: ', response);
  return response.policyId;
};

export const addOnePolicyToIp = async (ipId: Hex, policyId: string) => {
  const response = await storyClientA.policy.addPolicyToIp({
    policyId,
    ipId,
    txOptions: {
      waitForTransaction: true,
    },
  });
  console.log(`added policy ${policyId} to IP ${ipId}: `, response);
};

export const grantIp = async (ipId: Hex, receiver: Who = 'B', promoter: Who = 'A') => {
  const storyClient = getStoryClient(promoter);
  const receiverAddress = getReceiverAddress(receiver);
  const response = await storyClient.permission.setPermission({
    ipId,
    signer: receiverAddress,
    to: LICENSE_MODULE,
    func: '0x00000000',
    // permission level can be 0 (ABSTAIN), 1 (ALLOW), or * 2 (DENY)
    permission: 1,
    txOptions: {
      waitForTransaction: true,
    },
  });
  console.log(`${promoter} grant ${receiver} permission for IP ${ipId}`, response);
};

export const mintLicense = async (ipId: Hex, policyId: string, receiver: Who = 'B', promoter: Who = 'A') => {
  const storyClient = getStoryClient(promoter);
  const receiverAddress = getReceiverAddress(receiver);
  const response = await storyClient.license.mintLicense({
    policyId,
    licensorIpId: ipId,
    mintAmount: 1,
    receiverAddress,
    txOptions: {
      waitForTransaction: true,
    },
  });
  console.log(`${promoter} mint license to ${receiver} derived from IP ${ipId}: `, response);
  return response.licenseId;
};

export const linkIpToParent = async (childIpId: Hex, licenseIds: string[], who: Who = 'B') => {
  const storyClient = getStoryClient(who);
  const response = await storyClient.license.linkIpToParent({
    licenseIds,
    childIpId,
    txOptions: {
      waitForTransaction: true,
    },
  });
  console.log(`${who} linkIpToParent:`, response);
};

export const registerDerivativeIP = async (tokenId: string, licenseIds: string[], who: Who = 'A') => {
  const storyClient = getStoryClient(who);
  const response = await storyClient.ipAsset.registerDerivativeIp({
    licenseIds,
    tokenContractAddress: NFT_CONTRACT_ADDRESS,
    tokenId,
    txOptions: {
      waitForTransaction: true,
    },
  });
  console.log(`${who} RegisterDerivativeIP with licenses ${licenseIds}: `, response);
  return response.ipId;
};