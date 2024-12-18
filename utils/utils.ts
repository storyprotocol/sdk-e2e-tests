import { Hex, http, Address, createWalletClient, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import fs from 'fs';
import { nftContractAddress, rpcProviderUrl, royaltyPolicyLAPAddress, royaltyApproveAddress, disputeModuleAddress, ipAssetRegistryAddress, licenseTokenAddress, chainStringToViemChain } from "../config/config";
import { getLicenseTokenOwnerAbi, transferLicenseTokenAbi } from '../config/abi';

export function sleep(second: number) {
  return new Promise((resolve) => setTimeout(resolve, second * 1000));
};

export function writeToCSV(filename: string, headers: string[], data: any[]) {
  const csvHeader = headers.join(',');
  const csvData = data.map(row => headers.map(header => row[header]).join(',')).join('\n');
  const csvContent = `${csvHeader}\n${csvData}`;
  fs.writeFileSync(filename, csvContent);
};

export function captureConsoleLogs(consoleLogs:string[]){
  consoleLogs = [];
  const originalConsoleLog = console.log;
  console.log = function (...args: any[]) {
    consoleLogs.push(args.join(' '));
    originalConsoleLog.apply(console, args);
  };
  return consoleLogs;
};

export function getWalletClient(WALLET_PRIVATE_KEY: Hex){
  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address);
  const walletClient = createWalletClient({
    chain: chainStringToViemChain("odyssey"),
    transport: http(rpcProviderUrl),
    account
  });

  return walletClient;
};

export async function mintSPGNFT(WALLET_PRIVATE_KEY: Hex, NFT_COLLECTION_ADDRESS?: Address, nftMetadata?: string): Promise<string> {
  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address);
  const baseConfig = {
    chain: chainStringToViemChain("odyssey"),
    transport: http(rpcProviderUrl)    
  };
  const walletClient = createWalletClient({
    ...baseConfig,
    account
  });
  const publicClient = createPublicClient(baseConfig);
  const contractAbi = {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: "string", name: "nftMetadata", type: "string"},
    ],
    name: 'mint',
    outputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  };

  const requestArgs = {
    address: NFT_COLLECTION_ADDRESS || nftContractAddress,
    functionName: 'mint',
    args: [account.address, nftMetadata || 'test'],
    account: walletClient.account,
    abi: [contractAbi]    
  };

  // Mint an NFT to your account
  await publicClient.simulateContract(requestArgs);
  const hash = await walletClient.writeContract(requestArgs);
  const { logs } = await publicClient.waitForTransactionReceipt({
    hash: hash
  });

  let tokenId: any;
  if (logs[0].topics[3]) {
    tokenId = parseInt(logs[0].topics[3], 16);
  };

  console.log(`Minted NFT successful with hash: ` + JSON.stringify(hash) + `\nMinted NFT tokenId: ` + JSON.stringify(tokenId));
  return String(tokenId);
};

export async function mintNFT(WALLET_PRIVATE_KEY: Hex, NFT_COLLECTION_ADDRESS?: Address): Promise<string> {
  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address);
  const baseConfig = {
    chain: chainStringToViemChain("odyssey"),
    transport: http(rpcProviderUrl)    
  };
  const walletClient = createWalletClient({
    ...baseConfig,
    account
  });
  const publicClient = createPublicClient(baseConfig);
  const contractAbi = {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
    ],
    name: 'mint',
    outputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function'
  };

  const requestArgs = {
    address: NFT_COLLECTION_ADDRESS || nftContractAddress,
    functionName: 'mint',
    args: [account.address],
    account: walletClient.account,
    abi: [contractAbi]    
  };

  // Mint an NFT to your account
  await publicClient.simulateContract(requestArgs);
  const hash = await walletClient.writeContract(requestArgs);
  const { logs } = await publicClient.waitForTransactionReceipt({
    hash: hash
  });

  let tokenId: any;
  if (logs[0].topics[3]) {
    tokenId = parseInt(logs[0].topics[3], 16);
  };

  console.log(`Minted NFT successful with hash: ` + JSON.stringify(hash) + `\nMinted NFT tokenId: ` + JSON.stringify(tokenId));
  return String(tokenId);
};

export async function isRegistered(ipId: Address): Promise<boolean> {
  const baseConfig = {
    chain: chainStringToViemChain("odyssey"),
    transport: http(rpcProviderUrl)
  };

  const publicClient = createPublicClient(baseConfig);
  const contractAbi = {
    inputs: [{ internalType: 'address', name: 'id', type: 'address' }],
    name: 'isRegistered',
    outputs: [
      { internalType: 'bool', name: '', type: 'bool' }
    ],
    stateMutability: 'view',
    type: 'function'
  };

  const requestArgs = {
    address: ipAssetRegistryAddress as Address,
    functionName: 'isRegistered',
    args: [ipId as Address],
    abi: [contractAbi]
  };

  const result = await publicClient.readContract(requestArgs);
  console.log(result);

  return Boolean(result);
};

export async function mintNFTWithTokenID(WALLET_PRIVATE_KEY: Hex, id: number, NFT_COLLECTION_ADDRESS?: Address, nftMetadata?: string): Promise<string> {
  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address);
  const baseConfig = {
    chain: chainStringToViemChain("odyssey"),
    transport: http(rpcProviderUrl)    
  };
  const walletClient = createWalletClient({
    ...baseConfig,
    account
  });
  const publicClient = createPublicClient(baseConfig);
  const contractAbi = {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: "uint256", name: "tokenId",type: "uint256" },
      { internalType: "string", name: "nftMetadata", type: "string"},
    ],
    name: 'mintId',
    outputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  };

  const requestArgs = {
    address: NFT_COLLECTION_ADDRESS || nftContractAddress,
    functionName: 'mintId',
    args: [account.address, BigInt(id), nftMetadata],
    account: walletClient.account,
    abi: [contractAbi]   
  };

  //Mint an NFT to your account
  const { result } = await publicClient.simulateContract(requestArgs);
  const hash = await walletClient.writeContract(requestArgs);

  const { logs } = await publicClient.waitForTransactionReceipt({
    hash: hash
  });

  let tokenId: any;
  if (logs[0].topics[3]) {
    tokenId = parseInt(logs[0].topics[3], 16);
  };

  console.log(`Minted NFT successful with hash: ` + JSON.stringify(hash) + `\nMinted NFT tokenId: ` + JSON.stringify(tokenId));
  return String(tokenId);
};

export async function approveSpender(WALLET_PRIVATE_KEY: Hex, value: number) {
  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address);
  const baseConfig = {
    chain: chainStringToViemChain("odyssey"),
    transport: http(rpcProviderUrl)    
  };
  const walletClient = createWalletClient({
    ...baseConfig,
    account
  });
  const publicClient = createPublicClient(baseConfig);
  const contractAbi = {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: "uint256", name: "value",type: "uint256" }
    ],
    name: 'approve',
    outputs: [
      { internalType: 'bool', name: '', type: 'bool' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  };

  const requestArgs = {
    account: account,
    address: royaltyApproveAddress,
    functionName: 'approve',
    args: [royaltyPolicyLAPAddress, BigInt(value)],
    abi: [contractAbi]    
  };

  await publicClient.simulateContract(requestArgs);
  const hash = await walletClient.writeContract(requestArgs);
  await publicClient.waitForTransactionReceipt({
    hash: hash
  });
};

export async function mintAmount(WALLET_PRIVATE_KEY: Hex, amount: number){
  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address);
  const baseConfig = {
    chain: chainStringToViemChain("odyssey"),
    transport: http(rpcProviderUrl)    
  };
  const walletClient = createWalletClient({
    ...baseConfig,
    account
  });
  const publicClient = createPublicClient(baseConfig);
  const contractAbi = {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: "uint256", name: "amount",type: "uint256" }
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  };

  const requestArgs = {
    address: royaltyApproveAddress,
    functionName: 'mint',
    args: [account.address, BigInt(amount)],
    abi: [contractAbi],
    account: account    
  };

  await publicClient.simulateContract(requestArgs);
  const hash = await walletClient.writeContract(requestArgs);
  await publicClient.waitForTransactionReceipt({
    hash: hash
  });
};

export async function setDisputeJudgement(WALLET_PRIVATE_KEY: Hex, disputeId: bigint, decision: boolean, data: Hex) {
  try {
    const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address);
    const baseConfig = {
      chain: chainStringToViemChain("odyssey"),
      transport: http(rpcProviderUrl)    
    };
    const walletClient = createWalletClient({
      ...baseConfig,
      account
    });
    const publicClient = createPublicClient(baseConfig);
    const contractAbi = {
      inputs: [
        { internalType: "uint256", name: "disputeId", type: "uint256" },
        { internalType: "bool", name: "decision", type: "bool" },
        { internalType: "bytes", name: "data", type: "bytes" }
      ],
      name: 'setDisputeJudgement',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function',
    };

    const requestArgs = {
      address: disputeModuleAddress,
      functionName: 'setDisputeJudgement',
      args: [disputeId, decision, data],
      abi: [contractAbi],
      account: account    
    };

    await publicClient.simulateContract(requestArgs);
    const hash = await walletClient.writeContract(requestArgs);
    await publicClient.waitForTransactionReceipt({
      hash: hash
    });
  } catch (error) {
    console.error(error);
  }
};

export async function getLatestTokenId(): Promise<number> {
  const contractAddress = nftContractAddress;
  let latestTokenId: number | undefined;

  try {
    const res = await fetch(`https://story-network.explorer.caldera.xyz/api/v2/tokens/${contractAddress}/instances`);
    if (res.ok) {
      const { items } = await res.json();
      // console.log(items);
      latestTokenId = items[0].id;
    }
  } catch (err) {
    console.error(err);
  }

  return Number(latestTokenId);
};

export async function mintNFTWithRetry(WALLET_PRIVATE_KEY: Hex, NFT_COLLECTION_ADDRESS?: Address, nftMetadata?: string): Promise<string> {
  let tokenId: string = '';

  for (let i = 0; i < 3; i++) {
    try {
      tokenId = await mintSPGNFT(WALLET_PRIVATE_KEY, NFT_COLLECTION_ADDRESS, nftMetadata);
      break;
    } catch (error) {      
      if (i === 1) {
        try{
          const latestTokenId = await getLatestTokenId();
          tokenId = await mintNFTWithTokenID(WALLET_PRIVATE_KEY, Number(latestTokenId) + 1, NFT_COLLECTION_ADDRESS, nftMetadata);
          break;
        } catch (error) {
          tokenId = '';
        };       
      };
    };
  };

  return tokenId;
};

export async function getTotalRTSupply(): Promise<number> {
  const baseConfig = {
    chain: chainStringToViemChain("odyssey"),
    transport: http(rpcProviderUrl)    
  };

  const publicClient = createPublicClient(baseConfig);
  const contractAbi = {
    inputs: [],
    name: 'TOTAL_RT_SUPPLY',
    outputs: [
      { internalType: 'uint32', name: '', type: 'uint32' }
    ],
    stateMutability: 'view',
    type: 'function'
  };

  const requestArgs = {
    address: royaltyPolicyLAPAddress as Address,
    functionName: 'TOTAL_RT_SUPPLY',
    abi: [contractAbi]
  };

  const result = await publicClient.readContract(requestArgs);
  console.log(result);

  return Number(result);
};

export async function checkMintResult(tokenIdA: string){
  if (tokenIdA === '') {
    throw new Error('Unable to mint NFT');
  };
};

export async function getBlockTimestamp(): Promise<bigint> {
  const baseConfig = {
    chain: chainStringToViemChain("odyssey"),
    transport: http(rpcProviderUrl)    
  };
  const publicClient = createPublicClient(baseConfig);

  return (await publicClient.getBlock()).timestamp;
};

export function processResponse(response: any): { [key: string]: string | string[] } {
  const responseJson: { [key: string]: string | string[] } = {};
  Object.entries(response).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      responseJson[key] = value.map((item: any) => {
        if(typeof item === 'bigint') {
          return item.toString() + 'n';
        } else {
          return item as string;
        }
      });
    } else if (typeof value === 'bigint') {
      responseJson[key] = value.toString() + 'n';
    } else {
      responseJson[key] = value as string;
    }
  });
  return responseJson;
};

export const getDeadline = (deadline?: bigint | number | string): bigint => {
  if (deadline && (isNaN(Number(deadline)) || BigInt(deadline) < 0n)) {
    throw new Error("Invalid deadline value.");
  }
  const timestamp = BigInt(Date.now());
  return deadline ? timestamp + BigInt(deadline) : timestamp + 1000n;
};

export async function transferLicenseToken(WALLET_PRIVATE_KEY: Hex, from: Address, to: Address, licenseTokenId: number){
  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address);
  const baseConfig = {
    chain: chainStringToViemChain("odyssey"),
    transport: http(rpcProviderUrl)    
  };
  const walletClient = createWalletClient({
    ...baseConfig,
    account
  });
  const publicClient = createPublicClient(baseConfig);

  const requestArgs = {
    address: licenseTokenAddress,
    functionName: 'transferFrom',
    args: [from, to, licenseTokenId],
    abi: [transferLicenseTokenAbi],
    account: account    
  };

  await publicClient.simulateContract(requestArgs);
  const hash = await walletClient.writeContract(requestArgs);
  await publicClient.waitForTransactionReceipt({
    hash: hash
  });

  console.log(`Transaction hash: ${hash}`);

  return hash;
};

export async function getLicenseTokenOwner(tokenId: number): Promise<Address | unknown> {
  let result: Address | unknown;
  const baseConfig = {
    chain: chainStringToViemChain("odyssey"),
    transport: http(rpcProviderUrl)    
  };

  const publicClient = createPublicClient(baseConfig);

  const requestArgs = {
    address: licenseTokenAddress as Address,
    args: [tokenId],
    functionName: 'ownerOf',
    abi: [getLicenseTokenOwnerAbi]
  };

  result = await publicClient.readContract(requestArgs);
  console.log(`Owner: ${result}`);

  return result;
};

