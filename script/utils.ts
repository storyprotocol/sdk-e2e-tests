import { createWalletClient, Hex, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { StoryClient } from '@story-protocol/core-sdk';
import type { StoryConfig } from '@story-protocol/core-sdk';

export type Who = 'A' | 'B' | 'C';

export const accountA = privateKeyToAccount((import.meta.env.VITE_PRIVATE_KEYS?.split(',')[0] || '0x') as Hex);
export const accountB = privateKeyToAccount((import.meta.env.VITE_PRIVATE_KEYS?.split(',')[1] || '0x') as Hex);
export const accountC = privateKeyToAccount((import.meta.env.VITE_PRIVATE_KEYS?.split(',')[2] || '0x') as Hex);
const configA: StoryConfig = {
  transport: http(import.meta.env.VITE_RPC_URL),
  account: accountA,
};
const configB: StoryConfig = {
  transport: http(import.meta.env.VITE_RPC_URL),
  account: accountB,
};
const configC: StoryConfig = {
  transport: http(import.meta.env.VITE_RPC_URL),
  account: accountC,
};

export const clientA = createWalletClient({
  transport: http('https://rpc.ankr.com/eth_sepolia'),
  chain: sepolia,
  account: accountA,
});
export const clientB = createWalletClient({
  transport: http('https://rpc.ankr.com/eth_sepolia'),
  chain: sepolia,
  account: accountB,
});
export const clientC = createWalletClient({
  transport: http('https://rpc.ankr.com/eth_sepolia'),
  chain: sepolia,
  account: accountC,
});

export const storyClientA = StoryClient.newClient(configA);
export const storyClientB = StoryClient.newClient(configB);
export const storyClientC = StoryClient.newClient(configC);

export async function mintNFT(who: Who) {
  let client = clientA;
  let account = accountA;
  if (who === 'B') {
    client = clientB;
    account = accountB;
  }
  if (who === 'C') {
    client = clientC;
    account = accountC;
  }
  const hash = await client.writeContract({
    account,
    address: import.meta.env.VITE_NFT_CONTRACT,
    chain: sepolia,
    abi: [],
    functionName: 'mint',
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
  let receiverAddress = import.meta.env.VITE_WALLET_A_ADDRESS;
  if (receiver === 'B') receiverAddress = import.meta.env.VITE_WALLET_B_ADDRESS;
  if (receiver === 'C') receiverAddress = import.meta.env.VITE_WALLET_C_ADDRESS;
  return receiverAddress;
}

export function sleep(second: number) {
  return new Promise((resolve) => setTimeout(resolve, second * 1000));
}

export const registerRootIp = async (tokenId: string, who: Who = 'A') => {
  const storyClient = getStoryClient(who);
  const response = await storyClient.ipAsset.registerRootIp({
    tokenContractAddress: import.meta.env.VITE_NFT_CONTRACT,
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
    tokenContractAddress: import.meta.env.VITE_NFT_CONTRACT,
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
    mintingFeeToken: import.meta.env.VITE_MINT_FEE_TOKEN,
    mintingFee: '1000000000000000000',
    royaltyPolicy: import.meta.env.VITE_ROYALTY_POLICY,
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
    to: import.meta.env.VITE_LICENSE_MODULE,
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
    tokenContractAddress: import.meta.env.VITE_NFT_CONTRACT,
    tokenId,
    txOptions: {
      waitForTransaction: true,
    },
  });
  console.log(`${who} RegisterDerivativeIP with licenses ${licenseIds}: `, response);
  return response.ipId;
};
