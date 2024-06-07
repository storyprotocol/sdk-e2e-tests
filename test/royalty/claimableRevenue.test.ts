import { privateKeyA, privateKeyB, nftContractAddress, mintingFeeTokenAddress } from '../../config/config';
import { mintNFTWithRetry, checkMintResult } from '../../utils/utils';
import { registerIpAsset, attachLicenseTerms, registerDerivative, royaltyClaimableRevenue, royaltySnapshot } from '../../utils/sdkUtils';
import { Address } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { comRemixLicenseTermsId1, mintingFee1 } from '../setup';

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Address;
let ipIdB: Address;
let snapshotId1: bigint;
const waitForTransaction: boolean = true;

describe("SDK Test", function () {
    describe("Test royalty.claimableRevenue Function", async function () {
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
            expect(responseSnapshot.snapshotId).to.be.a("bigint").and.to.be.ok;

            snapshotId1 = responseSnapshot.snapshotId;
        });

        it("Check claimable revenue fail as undefined royaltyVaultIpId", async function () {
            let royaltyVaultIpId: any;
            const response = await expect(
                royaltyClaimableRevenue("A", royaltyVaultIpId, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith(`ailed to calculate claimable revenue: request.royaltyVaultIpId address is invalid: undefined, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Check claimable revenue fail as invalid parentIpId", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", "0x0000", ipIdA, "1", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith(`Failed to calculate claimable revenue: request.royaltyVaultIpId address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Check claimable revenue fail as non-existent parentIpId", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", "0xe967f54D03acc01CF624b54e0F24794a2f8f229a", ipIdA, "1", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: The royalty vault IP with id 0xe967F54d03ACc01CF624B54e0F24794A2f8f229a is not registered.");
        });

        it("Check claimable revenue fail as undefined account address", async function () {
            let account: any;
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, account, "1", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith(`Failed to calculate claimable revenue: request.account address is invalid: undefined, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Check claimable revenue fail as invalid account address", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, "0x0000", "1", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith(`Failed to calculate claimable revenue: request.account address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Check claimable revenue fail as undefined snapshotId", async function () {
            let snapshotId: any;
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId, mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Cannot convert undefined to a BigInt");
        });

        it("Check claimable revenue fail as invalid snapshotId", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, "test", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Cannot convert test to a BigInt");
        });

        it("Check claimable revenue fail as invalid snapshotId (-1)", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, "-1", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Number \"-1n\" is not in safe 256-bit unsigned integer range (0n to 115792089237316195423570985008687907853269984665640564039457584007913129639935n)");
        });

        it("Check claimable revenue fail as non-existent snapshotId", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, "999", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: The contract function \"claimableRevenue\" reverted with the following reason:", 
                                 "ERC20Snapshot: nonexistent id");
        });

        it("Check claimable revenue fail as invalid snapshotId (0)", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, "999", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: The contract function \"claimableRevenue\" reverted with the following reason:", 
                                 "ERC20Snapshot: id is 0");
        });

        it("Check claimable revenue fail as undefined token address", async function () {
            let tokenAddress: any;
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, tokenAddress, waitForTransaction)
            ).to.be.rejectedWith(`Failed to calculate claimable revenue: request.token address is invalid: undefined, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Check claimable revenue fail as invalid token address", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, "0x0000", waitForTransaction)
            ).to.be.rejectedWith(`Failed to calculate claimable revenue: request.token address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Check claimable revenue with waitForTransaction: undefined", async function () {
            let waitForTransaction: any;
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;

            expect(response).to.be.a("bigint").and.to.be.equal(BigInt(mintingFee1));
        });

        it("Check claimable revenue with waitForTransaction: true", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, true)
            ).to.not.be.rejected;

            expect(response).to.be.a("bigint").and.to.be.equal(BigInt(mintingFee1));
        });

        it("Check claimable revenue with waitForTransaction: false", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, false)
            ).to.not.be.rejected;

            expect(response).to.be.a("bigint").and.to.be.equal(BigInt(mintingFee1));
        });

        it("Check claimable revenue by non-owner", async function () {
            const response = await expect(
                royaltyClaimableRevenue("C", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, false)
            ).to.not.be.rejected;

            expect(response).to.be.a("bigint").and.to.be.equal(BigInt(mintingFee1));
        });
    });
});
