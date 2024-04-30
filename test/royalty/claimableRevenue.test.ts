import { privateKeyA, privateKeyB, nftContractAddress, mintingFeeTokenAddress } from '../../config/config';
import { mintNFTWithRetry, checkMintResult, sleep } from '../../utils/utils';
import { registerIpAsset, attachLicenseTerms, registerDerivative, registerCommercialRemixPIL, royaltyClaimableRevenue, royaltySnapshot } from '../../utils/sdkUtils';
import { Hex } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Hex;
let ipIdB: Hex;
let licenseTermsId1: string;
let snapshotId1: string;
const mintingFee: string = "100";
const commercialRevShare: number = 200;
const waitForTransaction: boolean = true;

describe("SDK Test", function () {
    describe("Test royalty.claimableRevenue Function", async function () {
        before("Register parent and derivative IP assets, capture snapshot", async function () {
            const responseLicenseTerm1 = await expect(
                registerCommercialRemixPIL("A", mintingFee, commercialRevShare, mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;

            licenseTermsId1 = responseLicenseTerm1.licenseTermsId;

            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);

            const responseRegisterIpAsset = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpAsset.ipId;

            const responseAttachLicenseTerms1 = await expect(
                attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
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
                registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], waitForTransaction)
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

        it("Check claimable revenue fail as undefined royaltyVaultIpId", async function () {
            let royaltyVaultIpId: any;
            const response = await expect(
                royaltyClaimableRevenue("A", royaltyVaultIpId, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Address \"undefined\" is invalid.");
        });

        it("Check claimable revenue fail as invalid parentIpId", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", "0x0000", ipIdA, "1", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Address \"0x0000\" is invalid.");
        });

        it("Check claimable revenue fail as non-existent parentIpId", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", "0xe967f54D03acc01CF624b54e0F24794a2f8f229a", ipIdA, "1", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Address \"0xe967f54D03acc01CF624b54e0F24794a2f8f229a\" is invalid.");
        });

        it("Check claimable revenue fail as undefined account address", async function () {
            let account: any;
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, account, "1", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Address \"undefined\" is invalid.");
        });

        it("Check claimable revenue fail as invalid account address", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, "0x0000", "1", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Address \"0x0000\" is invalid.");
        });

        it("Check claimable revenue fail as non-existent account address", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, "0xe967f54D03acc01CF624b54e0F24794a2f8f229a", "1", mintingFeeTokenAddress, waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Address \"0xe967f54D03acc01CF624b54e0F24794a2f8f229a\" is invalid.");
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
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Address \"undefined\" is invalid.");
        });

        it("Check claimable revenue fail as invalid token address", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, "0x0000", waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Address \"0x0000\" is invalid.");
        });

        it("Check claimable revenue fail as non-existent token address", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, "0xe967f54D03acc01CF624b54e0F24794a2f8f229a", waitForTransaction)
            ).to.be.rejectedWith("Failed to calculate claimable revenue: Address \"0xe967f54D03acc01CF624b54e0F24794a2f8f229a\" is invalid.");
        });

        it("Check claimable revenue with waitForTransaction: undefined", async function () {
            let waitForTransaction: any;
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;

            expect(response).to.be.a("string").and.to.be.equal(mintingFee);
        });

        it("Check claimable revenue with waitForTransaction: true", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, true)
            ).to.not.be.rejected;

            expect(response).to.be.a("string").and.to.be.equal(mintingFee);
        });

        it("Check claimable revenue with waitForTransaction: false", async function () {
            const response = await expect(
                royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, false)
            ).to.not.be.rejected;

            expect(response).to.be.a("string").and.to.be.equal(mintingFee);
        });

        it("Check claimable revenue by non-owner", async function () {
            const response = await expect(
                royaltyClaimableRevenue("C", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, false)
            ).to.not.be.rejected;

            expect(response).to.be.a("string").and.to.be.equal(mintingFee);
        });
    });
});
