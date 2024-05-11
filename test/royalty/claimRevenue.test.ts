import { privateKeyA, privateKeyB, nftContractAddress, mintingFeeTokenAddress } from '../../config/config';
import { mintNFTWithRetry, checkMintResult } from '../../utils/utils';
import { registerIpAsset, attachLicenseTerms, registerDerivative, royaltyClaimRevenue, royaltySnapshot } from '../../utils/sdkUtils';
import { Hex } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { comRemixLicenseTermsId1, mintingFee1 } from '../setup';

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Hex;
let ipIdB: Hex;
let snapshotId1: string;
const waitForTransaction: boolean = true;

describe("SDK Test", function () {
    describe("Test royalty.claimRevenue Function", async function () {
        before("Register parent and derivative IP assets, capture snapshot", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);

            const responseRegisterIpAsset = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpAsset.ipId;

            const responseAttachLicenseTerms1 = await expect(
                attachLicenseTerms("A", ipIdA, comRemixLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms1.txHash).to.be.a("string").and.not.empty;

            tokenIdB = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdB);

            const responseRegisterIpAssetB = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterIpAssetB.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAssetB.ipId).to.be.a("string").and.not.empty;

            ipIdB = responseRegisterIpAssetB.ipId;

            const responseRegisterDerivative1 = await expect(
                registerDerivative("B", ipIdB, [ipIdA], [comRemixLicenseTermsId1], waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterDerivative1.txHash).to.be.a("string").and.not.empty;

            const tokenId = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenId);

            const responseSnapshot = await expect(
                royaltySnapshot("A", ipIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseSnapshot.txHash).to.be.a("string").and.not.empty;
            expect(responseSnapshot.snapshotId).to.be.a("string").and.not.empty;

            snapshotId1 = responseSnapshot.snapshotId;
        });

        it("Claim revenue fail as undefined snapshotId", async function () {
            let snapshotId: any;
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: Cannot convert undefined to a BigInt");
        });

        it("Claim revenue fail as invalid snapshotId", async function () {
            const response = await expect(
                royaltyClaimRevenue("A", ["test"], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: Cannot convert test to a BigInt");
        });

        it("Claim revenue fail as non-existent snapshotId", async function () {
            const response = await expect(
                royaltyClaimRevenue("A", ["999"], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: Failed to execute the IP Account transaction: The contract function \"execute\" reverted with the following reason:", 
                                 "ERC20Snapshot: nonexistent id");
        });

        it("Claim revenue fail as undefined royaltyVaultIpId", async function () {
            let royaltyVaultIpId: any;
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], royaltyVaultIpId, ipIdA, mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: Address \"undefined\" is invalid.");
        });

        it("Claim revenue fail as invalid royaltyVaultIpId", async function () {
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], "0x0000", ipIdA, mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: Address \"0x0000\" is invalid.");
        });

        it("Claim revenue fail as non-existent royaltyVaultIpId", async function () {
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], "0xe967f54D03acc01CF624b54e0F24794a2f8f229b", ipIdA, mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: The royalty vault IP with id 0xE967F54d03aCC01Cf624b54E0f24794A2F8F229b is not registered.");
        });

        it("Claim revenue with undefined account address", async function () {
            let accountAddress: any;
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], ipIdA, accountAddress, mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.claimableToken).to.be.a("string").and.equal("0");
        });

        it("Claim revenue fail as invalid account address", async function () {
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], ipIdA, "0x00000", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: Address \"0x00000\" is invalid.");
        });

        it("Claim revenue fail as non-existent account address", async function () {
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], ipIdA, "0xe967f54D03acc01CF624b54e0F24794a2f8f229c", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: Failed to execute the IP Account transaction: The contract function \"execute\" returned no data (\"0x\").");
        });

        it("Claim revenue fail as undefined token address", async function () {
            let tokenAddress: any;
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, tokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: Address \"undefined\" is invalid.");
        });

        it("Claim revenue fail as invalid token address", async function () {
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, "0x0000", waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: Address \"0x0000\" is invalid.");
        });

        it("Claim revenue fail as non-existent token address", async function () {
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, "0xe967f54D03acc01CF624b54e0F24794a2f8f229c", waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: Failed to execute the IP Account transaction: The contract function \"execute\" reverted with the following reason:", 
                                 "Address: call to non-contract");
        });

        it("Claim revenue with waitForTransaction: true", async function () {
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, mintingFeeTokenAddress, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.claimableToken).to.be.a("string").and.equal(mintingFee1);
        });

        it("Claim revenue with waitForTransaction: false", async function () {
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, mintingFeeTokenAddress, false)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.claimableToken).to.not.be.exist;
        });

        it("Claim revenue with waitForTransaction: undefined", async function () {
            let waitForTransaction: any;
            const response = await expect(
                royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.claimableToken).to.not.be.exist;
        });

        it("Claim revenue fail by non-owner", async function () {
            const response = await expect(
                royaltyClaimRevenue("B", [snapshotId1], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to claim revenue: Failed to execute the IP Account transaction: The contract function \"execute\" reverted with the following signature:", "0x8ea0b111");
        });
    });
});
