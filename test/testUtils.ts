import { nftContractAddress, mintingFeeTokenAddress} from '../config/config'
import { checkMintResult, mintNFTWithRetry } from '../utils/utils'
import { registerIpAsset, attachLicenseTerms, registerDerivative, royaltySnapshot, collectRoyaltyTokens, royaltyClaimableRevenue, royaltyClaimRevenue, getRoyaltyVaultAddress, ipAccountExecute, storyClients } from '../utils/sdkUtils'
import { expect } from 'chai'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Address, Hex, encodeFunctionData } from 'viem';

const waitForTransaction: boolean = true;

export const mintNFTCreateRootIPandAttachPIL = async function(
    wallet: keyof typeof storyClients, 
    walletPrivateKey: Address,
    licenseTermsId: string | number | bigint
): Promise<Address> {
    const tokenId = await mintNFTWithRetry(walletPrivateKey);
    checkMintResult(tokenId);

    const responseRegisterIpAsset = await expect(
        registerIpAsset(wallet, nftContractAddress, tokenId, waitForTransaction)
    ).to.not.be.rejected;

    expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
    expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

    const ipId = responseRegisterIpAsset.ipId;

    const responseAttachLicenseTerms = await expect(
        attachLicenseTerms(wallet, ipId, licenseTermsId, waitForTransaction)
    ).to.not.be.rejected;

    expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;

    return ipId;
};

export const mintNFTAndRegisterDerivative = async function(
    wallet: keyof typeof storyClients, 
    walletPrivateKey: Address,
    parentIpIds: Address[],
    licenseTermsIds: string[] | bigint[] | number[]
): Promise<Address> {
    const tokenId = await mintNFTWithRetry(walletPrivateKey);
    checkMintResult(tokenId);

    const responseregisterIpAsset = await expect(
        registerIpAsset(wallet, nftContractAddress, tokenId, waitForTransaction)
    ).to.not.be.rejected;

    expect(responseregisterIpAsset.txHash).to.be.a("string").and.not.empty;
    expect(responseregisterIpAsset.ipId).to.be.a("string").and.not.empty;

    const ipId = responseregisterIpAsset.ipId;

    const response = await expect(
        registerDerivative(wallet, ipId, parentIpIds, licenseTermsIds, waitForTransaction)
    ).to.not.be.rejected;

    expect(response.txHash).to.be.a("string").and.not.empty;

    return ipId;
};

export const checkRoyaltyTokensCollected = async function(
    caller: keyof typeof storyClients,
    parentIpId: Address, 
    royaltyVaultIpId: Address,
    expectedRoyaltyTokensCollected: bigint
){
    const responseAFromB = await expect(
        collectRoyaltyTokens(caller, parentIpId, royaltyVaultIpId, waitForTransaction)
    ).to.not.be.rejected;

    expect(responseAFromB.txHash).to.be.a("string").and.not.empty;
    expect(responseAFromB.royaltyTokensCollected).to.be.a('bigint').and.to.be.equal(expectedRoyaltyTokensCollected);
};

export const getSnapshotId = async function(
    caller: keyof typeof storyClients,
    royaltyVaultIpId: Address
): Promise<bigint>{
    const response = await expect(
        royaltySnapshot(caller, royaltyVaultIpId, waitForTransaction)
    ).to.not.be.rejected;

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.snapshotId).to.be.a("bigint").and.to.be.ok;

    const snapshotId = response.snapshotId;
    return snapshotId;
};

export const checkClaimableRevenue = async function(
    caller: keyof typeof storyClients,
    royaltyVaultIpId: Address,
    account: Address,
    snapshotId: bigint,
    expectedClaimableRevenue: bigint
){
    const response = await expect(
        royaltyClaimableRevenue(caller, royaltyVaultIpId, account, snapshotId, mintingFeeTokenAddress, waitForTransaction)
    ).to.not.be.rejected;
    
    expect(response).to.be.a("bigint").and.to.be.equal(expectedClaimableRevenue);
};

export const claimRevenueByEOA = async function (
    caller: keyof typeof storyClients,
    snapshotIds: bigint[],
    royaltyVaultIpId: Address,
    expectedClaimableToken: bigint
) {
    const response = await expect(
        royaltyClaimRevenue(caller, snapshotIds, royaltyVaultIpId, mintingFeeTokenAddress, undefined, waitForTransaction)
    ).to.not.be.rejected;

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.claimableToken).to.be.a("bigint").to.be.equal(expectedClaimableToken);               
};

export const claimRevenueByIPA = async function (
    caller: keyof typeof storyClients,
    snapshotIds: bigint[],
    royaltyVaultIpId: Address,
    ipAccount: Address,
    expectedClaimableToken: bigint
) {
    const response = await expect(
        royaltyClaimRevenue(caller, snapshotIds, royaltyVaultIpId, mintingFeeTokenAddress, ipAccount, waitForTransaction)
    ).to.not.be.rejected;

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.claimableToken).to.be.a("bigint").to.be.equal(expectedClaimableToken);               
};

export const transferTokenToEOA = async function(
    caller: keyof typeof storyClients,
    royaltyVaultIpId: Address,
    toAddress: Address,
    amount: bigint
){
    const royaltyVaultAddress = await getRoyaltyVaultAddress(caller, royaltyVaultIpId);
    console.log(royaltyVaultAddress);
    
    const data = {
        abi: [
          {
            inputs: [
                { internalType: "address", name: "to", type: "address" },
                { internalType: "uint256", name: "value", type: "uint256" }
            ],
            name: "transfer",
            outputs: [
                { internalType: "bool", name: "", type: "bool" }
            ],
            stateMutability: "nonpayable",
            type: "function",
          },
        ],
        functionName: "transfer",
        args: [toAddress as Hex, amount]
    };

    const response = await expect(
        ipAccountExecute(caller, royaltyVaultAddress, 0, royaltyVaultIpId, encodeFunctionData(data), true)
    ).to.not.be.rejected;

    expect(response.txHash).to.be.a("string").and.not.empty;
};
