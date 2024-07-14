import { privateKeyA, privateKeyB, nftContractAddress } from '../../config/config';
import { mintNFTWithRetry } from '../../utils/utils';
import { registerIpAsset, attachLicenseTerms, registerDerivative } from '../../utils/sdkUtils';
import { expect } from 'chai';

import '../setup';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Hex } from 'viem';
import { nonComLicenseTermsId, comUseLicenseTermsId1, comUseLicenseTermsId2, comRemixLicenseTermsId1, comRemixLicenseTermsId2 } from '../setup';

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let ipIdA: Hex;
let ipIdB: Hex;
let ipIdC: Hex;

const waitForTransaction: boolean = true;

describe("SDK E2E Test - Register Derivative IP Asset with multiple PILs", function () {
    describe("@smoke Register derivative IP assets, parent IP asset with multiple commercial use PILs", async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            expect(tokenIdA).not.empty;
        });

        step("Wallet A register an IP Asset with tokenIdA and get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;
        });

        step("Wallet A attach comUseLicenseTermsId1 (commercial use PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Wallet A attach comUseLicenseTermsId2 (commercial use PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId2, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            expect(tokenIdB).not.empty;
        });

        step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdB)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdB = response.ipId;
        });

        step("Wallet B can use comUseLicenseTermsId1 to register ipIdB as ipIdA's derivative IP asset", async function () {
            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA], [comUseLicenseTermsId1], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
            tokenIdC = await mintNFTWithRetry(privateKeyB);
            expect(tokenIdC).not.empty;
        });

        step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdC)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdC, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdC = response.ipId;
        });

        step("Wallet B can NOT use comRemixLicenseTermsId1 to register ipIdC as ipIdA's derivative IP asset", async function () {
            const response = await expect(
                registerDerivative("B", ipIdC, [ipIdA], [comRemixLicenseTermsId1], waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative: License terms id " + comRemixLicenseTermsId1 + " must be attached to the parent ipId " + ipIdA + " before registering derivative.");
        });

        step("Wallet B can use comUseLicenseTermsId1 and comUseLicenseTermsId2 to register ipIdC as ipIdA's derivative IP asset", async function () {
            const response = await expect(
                registerDerivative("B", ipIdC, [ipIdA, ipIdA], [comUseLicenseTermsId1, comUseLicenseTermsId2], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });
    });

    describe("[smoke]Register derivative IP assets, parent IP asset with multiple commercial remix PILs", async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            expect(tokenIdA).not.empty;
        });

        step("Wallet A register an IP Asset with tokenIdA and get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;
        });

        step("Wallet A attach comRemixLicenseTermsId1(commercial remix PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comRemixLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Wallet A attach comRemixLicenseTermsId2(commercial remix PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comRemixLicenseTermsId2, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            expect(tokenIdB).not.empty;
        });

        step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdB)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdB = response.ipId;
        });

        step("Wallet B can use comRemixLicenseTermsId2 to register ipIdB as ipIdA's derivative IP asset", async function () {
            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA], [comRemixLicenseTermsId2], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
            tokenIdC = await mintNFTWithRetry(privateKeyB);
            expect(tokenIdC).not.empty;
        });

        step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdC)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdC, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdC = response.ipId;
        });

        step("Wallet B can NOT use nonComLicenseTermsId to register ipIdC as ipIdA's derivative IP asset", async function () {
            const response = await expect(
                registerDerivative("B", ipIdC, [ipIdA], [0n], waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative: License terms id 0 must be attached to the parent ipId " + ipIdA + " before registering derivative.");
        });

        step("Wallet B can use comRemixLicenseTermsId1 and comRemixLicenseTermsId2 to register ipIdC as ipIdA's derivative IP asset", async function () {
            const response = await expect(
                registerDerivative("B", ipIdC, [ipIdA, ipIdA], [comRemixLicenseTermsId1, comRemixLicenseTermsId2], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });
    });

    describe("Register a derivative IP asset, parent IP asset with multiple non-commericial and commercial PILs", async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            expect(tokenIdA).not.empty;
        });

        step("Wallet A register an IP Asset with tokenIdA and get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;
        });

        step("Wallet A attach comUseLicenseTermsId1(commercial use PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Wallet A attach comRemixLicenseTermsId1(commercial remix PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comRemixLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            expect(tokenIdB).not.empty;
        });

        step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdB)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdB = response.ipId;
        });

        step("Wallet B can NOT use comUseLicenseTermsId1, comRemixLicenseTermsId1 to register ipIdB as ipIdA's derivative IP asset", async function () {
            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA, ipIdA], [comUseLicenseTermsId1, comRemixLicenseTermsId1], waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", 
                                    "Error: LicensingModule__LicenseNotCompatibleForDerivative");
        });

        step("Wallet B can NOT use comUseLicenseTermsId1, nonComLicenseTermsId to register ipIdB as ipIdA's derivative IP asset", async function () {
            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA, ipIdA], [comUseLicenseTermsId1, nonComLicenseTermsId], waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", 
                                    "Error: LicensingModule__LicenseNotCompatibleForDerivative");
        });

        step("Wallet B can NOT use comRemixLicenseTermsId1, nonComLicenseTermsId to register ipIdB as ipIdA's derivative IP asset", async function () {
            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA, ipIdA], [comRemixLicenseTermsId1, nonComLicenseTermsId], waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", 
                                    "Error: LicensingModule__LicenseNotCompatibleForDerivative");
        });

        step("Wallet B can NOT use comUseLicenseTermsId1, comRemixLicenseTermsId1, nonComLicenseTermsId to register ipIdB as ipIdA's derivative IP asset", async function () {
            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA, ipIdA, ipIdA], [comUseLicenseTermsId1, comRemixLicenseTermsId1, nonComLicenseTermsId], waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", 
                                    "Error: LicensingModule__LicenseNotCompatibleForDerivative");
        });
    });
});