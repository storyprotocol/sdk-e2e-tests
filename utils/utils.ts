import { Hex, http, Address, createWalletClient, createPublicClient, Chain } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains';
import fs from 'fs';
import { chainStringToViemChain, nftContractAddress, rpcProviderUrl } from "../config/config";

const TEST_ENV = process.env.TEST_ENV as String
console.log(TEST_ENV)

let chainId: Chain
if (TEST_ENV == "sepolia") {
  chainId = sepolia
} else if (TEST_ENV == "storyTestnet") {
  chainId = chainStringToViemChain("storyTestnet")
} else {
  throw new Error(`Unknown TEST_ENV value: ${TEST_ENV}`);
}

export function sleep(second: number) {
  return new Promise((resolve) => setTimeout(resolve, second * 1000));
}

export function writeToCSV(filename: string, headers: string[], data: any[]) {
  const csvHeader = headers.join(',');
  const csvData = data.map(row => headers.map(header => row[header]).join(',')).join('\n');
  console.log(csvData)
  const csvContent = `${csvHeader}\n${csvData}`;
  fs.writeFileSync(filename, csvContent);
}

export function captureConsoleLogs(consoleLogs:string[]){
  consoleLogs = [];
  const originalConsoleLog = console.log;
  console.log = function (...args: any[]) {
    consoleLogs.push(args.join(' '));
    originalConsoleLog.apply(console, args);
  };
  return consoleLogs
}

export async function mintNFT(WALLET_PRIVATE_KEY: Hex): Promise<string> {
  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address)
  const baseConfig = {
    chain: chainId,
    transport: http(rpcProviderUrl)    
  }
  const walletClient = createWalletClient({
    ...baseConfig,
    account
  })
  const publicClient = createPublicClient(baseConfig)
  const contractAbi = {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' }],
    name: 'mint',
    outputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  }

  // 3. Mint an NFT to your account
  const { result } = await publicClient.simulateContract({
    address: process.env.MY_NFT_CONTRACT_ADDRESS as Address,
    functionName: 'mint',
    args: [account.address],
    abi: [contractAbi]
  })
  const hash = await walletClient.writeContract({
    address: process.env.MY_NFT_CONTRACT_ADDRESS as Address,
    functionName: 'mint',
    args: [account.address],
    abi: [contractAbi]
  })

  const { logs } = await publicClient.waitForTransactionReceipt({
    hash: hash,
  });

  let tokenId: any
  if (logs[0].topics[3]) {
    tokenId = parseInt(logs[0].topics[3], 16);
  }

  console.log(`Minted NFT successful with hash: ` + JSON.stringify(hash) + `\nMinted NFT tokenId: ` + JSON.stringify(tokenId));
  return String(tokenId);
}

export async function mintNFTWithTokenID(WALLET_PRIVATE_KEY: Hex, id: number): Promise<string> {
  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address)
  const baseConfig = {
    chain: chainId,
    transport: http(rpcProviderUrl)    
  }
  const walletClient = createWalletClient({
    ...baseConfig,
    account
  })
  const publicClient = createPublicClient(baseConfig)
  const contractAbi = {
    inputs: [
      { internalType: 'address', name: 'to', type: 'address' },
      { internalType: "uint256", name: "tokenId",type: "uint256" }
    ],
    name: 'mintId',
    outputs: [
      { internalType: 'uint256', name: 'tokenId', type: 'uint256' },
    ],
    stateMutability: 'nonpayable',
    type: 'function',
  }

  // 3. Mint an NFT to your account
  const { result } = await publicClient.simulateContract({
    address: nftContractAddress as Address,
    functionName: 'mintId',
    args: [account.address, BigInt(id)],
    abi: [contractAbi]
  })
  const hash = await walletClient.writeContract({
    address: nftContractAddress as Address,
    functionName: 'mintId',
    args: [account.address, BigInt(id)],
    abi: [contractAbi]
  })

  const { logs } = await publicClient.waitForTransactionReceipt({
    hash: hash,
  });

  let tokenId: any
  if (logs[0].topics[3]) {
    tokenId = parseInt(logs[0].topics[3], 16);
  }

  console.log(`Minted NFT successful with hash: ` + JSON.stringify(hash) + `\nMinted NFT tokenId: ` + JSON.stringify(tokenId));
  return String(tokenId);
}