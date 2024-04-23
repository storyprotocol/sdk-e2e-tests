import { privateKeyA, privateKeyB, privateKeyC, nftContractAddress, mintingFeeTokenAddress } from '../../config/config'
import { mintNFTWithRetry } from '../../utils/utils'
import { registerNonComSocialRemixingPIL, registerCommercialUsePIL, registerCommercialRemixPIL, registerIpAsset, attachLicenseTerms, registerDerivative } from '../../utils/sdkUtils'
import { expect } from 'chai'

import '../setup';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Hex } from 'viem';

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let tokenIdD: string;
let ipIdA: Hex;
let ipIdB: Hex;
let ipIdC: Hex;
let ipIdD: Hex;
let licenseTermsId1: string;
let licenseTermsId2: string;
let licenseTermsId3: string;
let licenseTermsId4: string;
let licenseTermsId5: string;

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function () {
    describe("Register Derivative IP Asset with multiple PILs", function () {
        this.beforeAll("Register non-commercial social remixing, commercial use and commercial remix PILs", async function () {
            const responseLicenseTerms1 = await expect(
                registerCommercialUsePIL("A", "1", mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;

            licenseTermsId1 = responseLicenseTerms1.licenseTermsId;

            const responseLicenseTerms2 = await expect(
                registerCommercialUsePIL("A", "20", mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;

            licenseTermsId2 = responseLicenseTerms2.licenseTermsId;

            const responseLicenseTerms3 = await expect(
                registerCommercialRemixPIL("A", "60", 200, mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;

            licenseTermsId3 = responseLicenseTerms3.licenseTermsId;

            const responseLicenseTerms4 = await expect(
                registerCommercialRemixPIL("A", "16", 100, mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;

            licenseTermsId4 = responseLicenseTerms4.licenseTermsId;

            const responseLicenseTerms5 = await expect(
                registerNonComSocialRemixingPIL("A", waitForTransaction)
            ).to.not.be.rejected;

            licenseTermsId5 = responseLicenseTerms5.licenseTermsId;
        });

        describe("[smoke]Register derivative IP assets, parent IP asset with multiple commercial use PILs", async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                if (tokenIdA === '') {
                    throw new Error('Unable to mint NFT');
                };
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

            step("Wallet A attach licenseTermsId1 (commercial use PIL) to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Wallet A attach licenseTermsId2 (commercial use PIL) to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId2, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                if (tokenIdB === '') {
                    throw new Error('Unable to mint NFT');
                };
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

            step("Wallet B can use licenseTermsId1 to register ipIdB as ipIdA's derivative IP asset", async function () {
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
                tokenIdC = await mintNFTWithRetry(privateKeyB);
                if (tokenIdB === '') {
                    throw new Error('Unable to mint NFT');
                };
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

            step("Wallet B can NOT use licenseTermsId3 to register ipIdC as ipIdA's derivative IP asset", async function () {
                const response = await expect(
                    registerDerivative("B", ipIdC, [ipIdA], [licenseTermsId3], waitForTransaction)
                ).to.be.rejectedWith("Failed to register derivative: License terms id " + licenseTermsId3 + " must be attached to the parent ipId " + ipIdA + " before registering derivative.");
            });

            step("Wallet B can use licenseTermsId1 and licenseTermsId2 to register ipIdC as ipIdA's derivative IP asset", async function () {
                const response = await expect(
                    registerDerivative("B", ipIdC, [ipIdA, ipIdA], [licenseTermsId1, licenseTermsId2], waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });
        });

        describe("[smoke]Register derivative IP assets, parent IP asset with multiple commercial remix PILs", async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                if (tokenIdA === '') {
                    throw new Error('Unable to mint NFT');
                };
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

            step("Wallet A attach licenseTermsId3(commercial remix PIL) to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId3, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Wallet A attach licenseTermsId4(commercial remix PIL) to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId4, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                if (tokenIdB === '') {
                    throw new Error('Unable to mint NFT');
                };
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

            step("Wallet B can use licenseTermsId4 to register ipIdB as ipIdA's derivative IP asset", async function () {
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId4], waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
                tokenIdC = await mintNFTWithRetry(privateKeyB);
                if (tokenIdB === '') {
                    throw new Error('Unable to mint NFT');
                };
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

            step("Wallet B can NOT use licenseTermsId5 to register ipIdC as ipIdA's derivative IP asset", async function () {
                const response = await expect(
                    registerDerivative("B", ipIdC, [ipIdA], [licenseTermsId5], waitForTransaction)
                ).to.be.rejectedWith("Failed to register derivative: License terms id " + licenseTermsId5 + " must be attached to the parent ipId " + ipIdA + " before registering derivative.");
            });

            step("Wallet B can use licenseTermsId3 and licenseTermsId4 to register ipIdC as ipIdA's derivative IP asset", async function () {
                const response = await expect(
                    registerDerivative("B", ipIdC, [ipIdA, ipIdA], [licenseTermsId3, licenseTermsId4], waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });
        });

        describe("Register a derivative IP asset, parent IP asset with multiple non-commericial and commercial PILs", async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                if (tokenIdA === '') {
                    throw new Error('Unable to mint NFT');
                };
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

            step("Wallet A attach licenseTermsId1(commercial use PIL) to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Wallet A attach licenseTermsId3(commercial remix PIL) to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId3, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Wallet A attach licenseTermsId5(non-commercial social remixing PIL) to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId5, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                if (tokenIdB === '') {
                    throw new Error('Unable to mint NFT');
                };
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

            step("Wallet B can NOT use licenseTermsId1, licenseTermsId3 to register ipIdB as ipIdA's derivative IP asset", async function () {
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA, ipIdA], [licenseTermsId1, licenseTermsId3], waitForTransaction)
                ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", 
                                     "Error: LicensingModule__LicenseNotCompatibleForDerivative");
            });

            step("Wallet B can NOT use licenseTermsId1, licenseTermsId5 to register ipIdB as ipIdA's derivative IP asset", async function () {
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA, ipIdA], [licenseTermsId1, licenseTermsId5], waitForTransaction)
                ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", 
                                     "Error: LicensingModule__LicenseNotCompatibleForDerivative");
            });

            step("Wallet B can NOT use licenseTermsId3, licenseTermsId5 to register ipIdB as ipIdA's derivative IP asset", async function () {
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA, ipIdA], [licenseTermsId3, licenseTermsId5], waitForTransaction)
                ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", 
                                     "Error: LicensingModule__LicenseNotCompatibleForDerivative");
            });

            step("Wallet B can NOT use licenseTermsId1, licenseTermsId3, licenseTermsId5 to register ipIdB as ipIdA's derivative IP asset", async function () {
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA, ipIdA, ipIdA], [licenseTermsId1, licenseTermsId3, licenseTermsId5], waitForTransaction)
                ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", 
                                     "Error: LicensingModule__LicenseNotCompatibleForDerivative");
            });
        });
    });
});