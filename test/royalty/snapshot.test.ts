import { privateKeyA, privateKeyB, nftContractAddress } from '../../config/config';
import { mintNFTWithRetry, checkMintResult, sleep } from '../../utils/utils';
import { registerIpAsset, royaltySnapshot, attachLicenseTerms, registerDerivative } from '../../utils/sdkUtils';
import { Address } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { comUseLicenseTermsId1 } from '../setup';

const waitForTransaction: boolean = true;

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let ipIdA: Address;
let ipIdB: Address;
let ipIdC: Address;

describe("SDK Test", function () {
    describe("Test royalty.snapshot function", async function () {
        before("Register parent and derivative IP assets", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);

            const responseRegisterIpAsset = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpAsset.ipId;

            const responseAttachLicenseTerms = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;

            tokenIdB = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdB);

            const responseregisterIpAssetB = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
            expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;

            ipIdB = responseregisterIpAssetB.ipId;

            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA], [comUseLicenseTermsId1], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;

            tokenIdC = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);

            const responseRegisterIpAssetC = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdC, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterIpAssetC.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAssetC.ipId).to.be.a("string").and.not.empty;

            ipIdC = responseRegisterIpAssetC.ipId;
        });

        it("Captue snapshot fail as undefined ipId", async function () {
            let ipIdA: any;
            const response = await expect(
                royaltySnapshot("A", ipIdA, waitForTransaction)
            ).to.be.rejectedWith("Failed to snapshot: Address \"undefined\" is invalid.");

        });

        it("Captue snapshot fail as invalid ipId", async function () {
            const response = await expect(
                royaltySnapshot("A", "0x0000", waitForTransaction)
            ).to.be.rejectedWith("Failed to snapshot: Address \"0x0000\" is invalid.");

        });

        it("Captue snapshot fail as non-existent ipId", async function () {
            let ipIdA: any;
            const response = await expect(
                royaltySnapshot("A", "0x7F51F6AC36B5d618545345baDbe22E40ed113e2a", waitForTransaction)
            ).to.be.rejectedWith("Failed to snapshot: The royalty vault IP with id 0x7f51f6AC36B5D618545345badBe22e40eD113e2A is not registered.");
        });

        it("Captue snapshot by non-owner", async function () {
            const response = await expect(
                royaltySnapshot("B", ipIdA, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.snapshotId).to.be.a("bigint").and.to.be.ok;
        });

        it("Captue snapshot for no valut account", async function () {
            const response = await expect(
                royaltySnapshot("C", ipIdC, true)
            ).to.be.rejectedWith("Failed to snapshot: The contract function \"snapshot\" returned no data (\"0x\").");
        });

        it("Captue snapshot with waitForTransaction: true", async function () {
            await sleep(20);
            const response = await expect(
                royaltySnapshot("C", ipIdB, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.snapshotId).to.be.a("bigint").and.to.be.ok;
        });

        it("Captue snapshot with waitForTransaction: false", async function () {
            const response = await expect(
                royaltySnapshot("A", ipIdA, false)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.snapshotId).to.not.be.exist;
        });

        it("Captue snapshot with waitForTransaction: undefined", async function () {
            await sleep(10);
            let waitForTransaction: any;
            const response = await expect(
                royaltySnapshot("C", ipIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.snapshotId).to.not.be.exist;
        });
    });
});