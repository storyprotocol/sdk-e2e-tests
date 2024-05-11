import { privateKeyA, privateKeyB, privateKeyC, nftContractAddress } from '../../config/config';
import { mintNFTWithRetry, checkMintResult, sleep } from '../../utils/utils';
import { registerIpAsset, attachLicenseTerms, registerDerivative, collectRoyaltyTokens } from '../../utils/sdkUtils';
import { Hex } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { comRemixLicenseTermsId1, comRemixLicenseTermsId2, commercialRevShare1, commercialRevShare2 } from '../setup';

const waitForTransaction: boolean = true;

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let tokenIdD: string;
let tokenIdE: string;
let ipIdA: Hex;
let ipIdB: Hex;
let ipIdC: Hex;
let ipIdD: Hex;
let ipIdE: Hex;

describe("SDK Test", function () {
    describe("Test royalty.collectRoyaltyTokens Function", async function () {
        before("Register parent and derivative IP assets", async function () {
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

            const responseAttachLicenseTerms2 = await expect(
                attachLicenseTerms("A", ipIdA, comRemixLicenseTermsId2, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms2.txHash).to.be.a("string").and.not.empty;

            tokenIdB = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdB);

            const responseregisterIpAssetB = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
            expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;

            ipIdB = responseregisterIpAssetB.ipId;

            const responseRegisterDerivative1 = await expect(
                registerDerivative("B", ipIdB, [ipIdA], [comRemixLicenseTermsId1], waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterDerivative1.txHash).to.be.a("string").and.not.empty;

            tokenIdE = await mintNFTWithRetry(privateKeyC);
            checkMintResult(tokenIdE);

            const responseregisterIpAssetE = await expect(
                registerIpAsset("C", nftContractAddress, tokenIdE, waitForTransaction)
            ).to.not.be.rejected;

            ipIdE = responseregisterIpAssetE.ipId;

            await sleep(20);
        });

        it("Collect royalty tokens fail as undefined parentIpId", async function () {
            let parentIpId: any;
            const response = await expect(
                collectRoyaltyTokens("B", parentIpId, ipIdB, waitForTransaction)
            ).to.be.rejectedWith("Failed to collect royalty tokens: Address \"undefined\" is invalid.");
        });

        it("Collect royalty tokens fail as invalid parentIpId", async function () {
            const response = await expect(
                collectRoyaltyTokens("B", "0x0000", ipIdB, waitForTransaction)
            ).to.be.rejectedWith("Failed to collect royalty tokens: Address \"0x0000\" is invalid.");
        });

        it("Collect royalty tokens fail as non-existent parentIpId", async function () {
            const response = await expect(
                collectRoyaltyTokens("B", "0xe967f54D03acc01CF624b54e0F24794a2f8f229a", ipIdB, waitForTransaction)
            ).to.be.rejectedWith("Failed to collect royalty tokens: The parent IP with id 0xe967f54D03acc01CF624b54e0F24794a2f8f229a is not registered.");
        });

        it("Collect royalty tokens fail as undefined royaltyVaultIpId", async function () {
            let royaltyVaultIpId: any;
            const response = await expect(
                collectRoyaltyTokens("B", ipIdA, royaltyVaultIpId, waitForTransaction)
            ).to.be.rejectedWith("Failed to collect royalty tokens: Address \"undefined\" is invalid.");
        });

        it("Collect royalty tokens fail as invalid royaltyVaultIpId", async function () {
            const response = await expect(
                collectRoyaltyTokens("B", ipIdA, "0x0000", waitForTransaction)
            ).to.be.rejectedWith("Failed to collect royalty tokens: Address \"0x0000\" is invalid.");
        });

        it("Collect royalty tokens fail as non-existent royaltyVaultIpId", async function () {
            const response = await expect(
                collectRoyaltyTokens("B", ipIdA, "0xe967f54D03acc01CF624b54e0F24794a2f8f229b", waitForTransaction)
            ).to.be.rejectedWith("Failed to collect royalty tokens: The royalty vault IP with id 0xE967F54d03aCC01Cf624b54E0f24794A2F8F229b is not registered.");
        });

        it("Collect royalty tokens with waitForTransaction: true", async function () {
            const response = await expect(
                collectRoyaltyTokens("B", ipIdA, ipIdB, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.royaltyTokensCollected).to.be.a("string").and.equal(String(commercialRevShare1));
        });

        it("Collect royalty tokens fail as already claimed", async function () {
            const response = await expect(
                collectRoyaltyTokens("A", ipIdA, ipIdB, true)
            ).to.be.rejectedWith("Failed to collect royalty tokens: The contract function \"collectRoyaltyTokens\" reverted.", 
                                 "Error: IpRoyaltyVault__AlreadyClaimed()");
        });

        it("Collect royalty tokens for derivative IP only attached 1 license terms", async function () {
            tokenIdC = await mintNFTWithRetry(privateKeyC);
            checkMintResult(tokenIdC);

            const responseregisterIpAssetC = await expect(
                registerIpAsset("C", nftContractAddress, tokenIdC, waitForTransaction)
            ).to.not.be.rejected;

            ipIdC = responseregisterIpAssetC.ipId;

            const responseRegisterDerivative2 = await expect(
                registerDerivative("C", ipIdC, [ipIdA], [comRemixLicenseTermsId2], waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterDerivative2.txHash).to.be.a("string").and.not.empty;

            const response = await expect(
                collectRoyaltyTokens("C", ipIdA, ipIdC, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.royaltyTokensCollected).to.be.a("string").and.equal(String(commercialRevShare2));
        });

        it("Collect royalty tokens for derivative IP attached multiple license terms", async function () {
            tokenIdD = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdD);

            const responseregisterIpAssetD = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdD, waitForTransaction)
            ).to.not.be.rejected;

            ipIdD = responseregisterIpAssetD.ipId;

            const responseRegisterDerivative3 = await expect(
                registerDerivative("B", ipIdD, [ipIdA, ipIdA], [comRemixLicenseTermsId1, comRemixLicenseTermsId2], waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterDerivative3.txHash).to.be.a("string").and.not.empty;

            const response = await expect(
                collectRoyaltyTokens("B", ipIdA, ipIdD, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.royaltyTokensCollected).to.be.a("string").and.equal(String(commercialRevShare1 + commercialRevShare2));
        });

        it("Collect royalty tokens fail as royaltyVaultIpId is not derivative IP", async function () {
            const response = await expect(
                collectRoyaltyTokens("B", ipIdA, ipIdE, waitForTransaction)
            ).to.be.rejectedWith("Failed to collect royalty tokens: Cannot read properties of undefined (reading 'royaltyTokensCollected')");
        });

        it("Collect royalty tokens fail as royaltyVaultIpId is the root IP id", async function () {
            const response = await expect(
                collectRoyaltyTokens("A", ipIdA, ipIdA, waitForTransaction)
            ).to.be.rejectedWith("Failed to collect royalty tokens: The contract function \"collectRoyaltyTokens\" reverted.", 
                                 "Error: IpRoyaltyVault__ClaimerNotAnAncestor()");
        });

        it("Collect royalty tokens fail as parentIpId is not the root IP id", async function () {
            const response = await expect(
                collectRoyaltyTokens("A", ipIdB, ipIdC, waitForTransaction)
            ).to.be.rejectedWith("Failed to collect royalty tokens: The contract function \"collectRoyaltyTokens\" reverted.", 
                                 "Error: IpRoyaltyVault__ClaimerNotAnAncestor()");
        });

        it("Collect royalty tokens with waitForTransaction: false", async function () {
            const responseRegisterDerivative4 = await expect(
                registerDerivative("C", ipIdE, [ipIdC], [comRemixLicenseTermsId2], waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterDerivative4.txHash).to.be.a("string").and.not.empty;

            const response = await expect(
                collectRoyaltyTokens("A", ipIdC, ipIdE, false)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });
    });
});
