import { privateKeyA, privateKeyB, privateKeyC, nftContractAddress } from '../../config/config';
import { checkMintResult, mintNFT, mintNFTWithRetry } from '../../utils/utils';
import { Address } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { registerIpAsset, attachLicenseTerms, registerDerivative } from '../../utils/sdkUtils';
import { comUseLicenseTermsId1, comUseLicenseTermsId2, comRemixLicenseTermsId1 } from '../setup';

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let ipIdA: Address;
let ipIdB: Address;
let ipIdC: Address;

const waitForTransaction: boolean = true;

describe("SDK Test", function () {
    describe("Attach license terms - license.attachLicenseTerms", async function () {
        before("Register license terms and IP assets", async function () {
            tokenIdA = await mintNFT(privateKeyA);
            checkMintResult(tokenIdA);

            const responseA = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;
            ipIdA = responseA.ipId;

            tokenIdB = await mintNFT(privateKeyB);
            checkMintResult(tokenIdB);

            const responseB = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, true)
            ).to.not.be.rejected;
            ipIdB = responseB.ipId;

            tokenIdC = await mintNFT(privateKeyA);
            checkMintResult(tokenIdC);

            const responseC = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdC, true)
            ).to.not.be.rejected;
            ipIdC = responseC.ipId;
        });

        describe("Attach license terms - negative tests", async function () {
            it("Non-owner attach license terms", async function () {
                const response = await expect(
                    attachLicenseTerms("B", ipIdA, comUseLicenseTermsId1, true)
                ).to.be.rejectedWith("The contract function \"attachLicenseTerms\" reverted with the following signature:");
            });
    
            it("Attach license terms with ipId: undefined", async function () {
                let ipId: any;
                const response = await expect(
                    attachLicenseTerms("A", ipId, comUseLicenseTermsId1, true)
                ).to.be.rejectedWith(`Failed to attach license terms: request.ipId address is invalid: undefined, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
            });
    
            it("Attach license terms with an invalid ipId", async function () {
                const response = await expect(
                    attachLicenseTerms("A", "0x0000", comUseLicenseTermsId1, true)
                ).to.not.be.rejectedWith("InvalidAddressError: Address \"0x0000\" is invalid.");
            });
    
            it("Attach license terms with a non-existent ipId", async function () {
                const response = await expect(
                    attachLicenseTerms("A", "0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAB", comUseLicenseTermsId1, true)
                ).to.be.rejectedWith("Failed to attach license terms: The IP with id 0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAB is not registered.");
            });
    
            it("Attach license terms with licenseTermsId: undefined", async function () {
                let licenseTermsId: any;
                const response = await expect(          
                    attachLicenseTerms("A", ipIdA, licenseTermsId, true)
                ).to.be.rejectedWith("Cannot convert undefined to a BigInt");
            });
    
            it("Attach license terms with an invalid licenseTermsId", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, "test", true)
                ).to.be.rejectedWith("Cannot convert test to a BigInt");
            });
    
            it("Attach license terms with a non-existent licenseTermsId", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, "999999", true)
                ).to.be.rejectedWith("Failed to attach license terms: License terms id 999999 do not exist.");
            });                
        })

        describe("Attach license terms", async function () {
            it("Attach license terms with waitForTransaction: undefined", async function () {
                let waitForTransaction: any;
                const response = await expect(          
                    attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
                expect(response.txHash).to.be.a("string").and.not.empty;
            });
    
            it("Attach license terms with waitForTransaction: true", async function () {
                const response = await expect(
                    attachLicenseTerms("B", ipIdB, comUseLicenseTermsId1, true)
                ).to.not.be.rejected;
                expect(response.txHash).to.be.a("string").and.not.empty;
            });
    
            it("Attach license terms that is already attached to the IP Asset", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, true)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.empty;
                expect(response.success).to.be.equals(false);
            });
    
            it("Attach license terms with waitForTransaction: false", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdC, comUseLicenseTermsId1, false)
                ).to.not.be.rejected;
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.not.be.exist;
            });                
        })

        describe("Attach license terms to parent/derivative IP assets", async function () {
            before("Register IP assets", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                checkMintResult(tokenIdA);

                tokenIdB = await mintNFT(privateKeyB);
                checkMintResult(tokenIdB);

                tokenIdC = await mintNFT(privateKeyC);
                checkMintResult(tokenIdB);
            })

            step("Wallet A register an IP Asset with tokenIdA and get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;

                ipIdA = response.ipId;
            })

            step("Wallet A attach comUseLicenseTermsId1(commercial use PIL) to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;

                ipIdB = response.ipId;                
            })

            step("Wallet B register a derivative IP asset with ipIdA and comUseLicenseTermsId1", async function () {
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [comUseLicenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Derivative IP asset can NOT attach more license terms", async function () {
                const response = await expect(
                    attachLicenseTerms("B", ipIdB, comUseLicenseTermsId2, waitForTransaction)
                ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted with the following signature:", "0x1ae3058f");
            });

            step("Parent IP asset can attach more license terms（commercial PIL）", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, comUseLicenseTermsId2, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Parent IP asset can attach more license terms（non-commercial PIL）", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, 0n, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Wallet C register an IP Asset with tokenIdC and get an ipId (ipIdC)", async function () {
                const response = await expect(
                    registerIpAsset("C", nftContractAddress, tokenIdC, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;

                ipIdC = response.ipId;
            });

            step("Derivative IP asset (ipIdB) can NOT attach more license terms", async function () {
                const response = await expect(
                    attachLicenseTerms("B", ipIdB, comUseLicenseTermsId2, waitForTransaction)
                ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted with the following signature:", "0x1ae3058f");
            });

            step("Wallet C register a derivative IP asset with ipIdC and comUseLicenseTermsId1", async function () {
                const response = await expect(
                    registerDerivative("C", ipIdC, [ipIdB], [comUseLicenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Derivative IP asset (ipIdC) can NOT attach more license terms", async function () {
                const response = await expect(
                    attachLicenseTerms("C", ipIdC, comRemixLicenseTermsId1, waitForTransaction)
                ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted with the following signature:", "0x1ae3058f");
            });
        });
    });
});
