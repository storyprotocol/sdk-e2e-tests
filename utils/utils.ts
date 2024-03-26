import { Hex, http, Address, createWalletClient, createPublicClient } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains';
import fs from 'fs';

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
  console.log('Minting a new NFT...')

  const account = privateKeyToAccount(WALLET_PRIVATE_KEY as Address)
  const walletClient = createWalletClient({
    account,
    chain: sepolia,
    transport: http(),
  })
  const publicClient = createPublicClient({
    chain: sepolia,
    transport: http()
  })
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

  console.log(`Minted NFT successful with hash: ${hash}`);
  console.log(`Minted NFT tokenId: ${tokenId}`);

  return String(tokenId);
}