import { privateKeyA, accountB, nftContractAddress, mintingFeeTokenAddress } from '../../config/config';
import { attachLicenseTerms, mintLicenseTokens, registerCommercialRemixPIL, registerCommercialUsePIL, registerIpAsset, registerNonComSocialRemixingPIL } from '../../utils/sdkUtils';
import { checkMintResult, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Hex } from 'viem';

let tokenIdA: string;
let tokenIdB: string;
let licenseTermsId1: "string";
let licenseTermsId2: "string";
let licenseTermsId3: "string";
let ipIdA: Hex;
let ipIdB: Hex;

const waitForTransaction: boolean = true;

describe('SDK Test', function () {
    describe('Test license.mintLicenseTokens Function', async function () {
        before("Register license terms and IP assets",async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);

            tokenIdB = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdB);

            const responseLicenseTerms1 = await expect(
                registerNonComSocialRemixingPIL("A", waitForTransaction)
            ).to.not.be.rejected;
            expect(responseLicenseTerms1.licenseTermsId).to.be.a("string").and.not.empty;

            licenseTermsId1 = responseLicenseTerms1.licenseTermsId;

            const responseLicenseTerms2 = await expect(
                registerCommercialUsePIL("A", "100", mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;
            expect(responseLicenseTerms2.licenseTermsId).to.be.a("string").and.not.empty;

            licenseTermsId2 = responseLicenseTerms2.licenseTermsId;

            const responseLicenseTerms3 = await expect(
                registerCommercialRemixPIL("A", "10", 100, mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;
            expect(responseLicenseTerms3.licenseTermsId).to.be.a("string").and.not.empty;

            licenseTermsId3 = responseLicenseTerms3.licenseTermsId;

            const responseA = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseA.txHash).to.be.a("string").and.not.empty;
            expect(responseA.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseA.ipId;

            const response = await expect(
                attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;

            const responseB = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseB.txHash).to.be.a("string").and.not.empty;
            expect(responseB.ipId).to.be.a("string").and.not.empty;

            ipIdB = responseB.ipId;
        });

        describe('Mint License Tokens - Negative Tests', async function () {
            it("Mint a license token fail as undefined ipId", async function () {
                let ipIdA: any;
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, 2, accountB.address, true)      
                ).to.be.rejectedWith("Failed to mint license tokens: Address \"undefined\" is invalid.");
            });

            it("Mint a license token fail as invalid ipId", async function () {
                const response = await expect(
                    mintLicenseTokens("A", "0x0000", licenseTermsId1, 2, accountB.address, true)      
                ).to.be.rejectedWith("Failed to mint license tokens: Address \"0x0000\" is invalid.");
            });

            it("Mint a license token fail as non-existent ipId", async function () {
                const response = await expect(
                    mintLicenseTokens("A", "0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAB", licenseTermsId1, 2, accountB.address, true)      
                ).to.be.rejectedWith("Failed to mint license tokens: Address \"0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAB\" is invalid.");
            });

            it("Mint a license token fail as undefined licenseTermsId", async function () {
                let licenseTermsId1: any;
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, 2, accountB.address, true)      
                ).to.be.rejectedWith("Failed to mint license tokens: Cannot convert undefined to a BigInt");
            });

            it("Mint a license token fail as invalid licenseTermsId", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, "test", 2, accountB.address, true)      
                ).to.be.rejectedWith("Failed to mint license tokens: Cannot convert test to a BigInt");
            });

            it("Mint a license token fail as non-existent licenseTermsId", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, "9999999", 2, accountB.address, true)      
                ).to.be.rejectedWith("Failed to mint license tokens: License terms id 9999999 do not exist.");
            });

            it("Mint a license token fail as invalid amount value (-1)", async function () {
                let receiver: any;
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, -1, receiver, true)      
                ).to.be.rejectedWith("Failed to mint license tokens: Number \"-1n\" is not in safe 256-bit unsigned integer range (0n to 115792089237316195423570985008687907853269984665640564039457584007913129639935n)");
            });

            it("Mint a license token fail as invalid amount value", async function () {
                let receiver: any;
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, 9007199254740992, receiver, true)      
                ).to.be.rejectedWith("Failed to mint license tokens: Execution reverted for an unknown reason.");
            });

            it("Mint a license token fail as invalid receiver address", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, 2, "0x0000", true)      
                ).to.be.rejectedWith("Failed to mint license tokens: Address \"0x0000\" is invalid.");
            });

            it("Mint a license token fail as non-existent receiver address", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, 2, "0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a", true)      
                ).to.be.rejectedWith("Failed to mint license tokens: Address \"0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a\" is invalid.");
            });

            it("Mint a license token fail as not attached licenseTermsId", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdB, licenseTermsId1, 2, "0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a", true)      
                ).to.be.rejectedWith("Failed to mint license tokens: License terms id " + licenseTermsId1 + " is not attached to the IP with id " + ipIdB);
            });
        });

        describe("Mint License Tokens - Positive Tests", async function () {
            it("Mint a license token with undefined amount", async function () {
                let amount: any;
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, amount, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
            });

            it("Mint a license token with amount: 0", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, 0, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
            });
            
            it("Mint a license token by non-owner", async function () {
                const response = await expect(
                    mintLicenseTokens("B", ipIdA, licenseTermsId1, 2, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
            });
                        
            it("Mint a license token with undefined receiver address", async function () {
                let receiver: any;
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, 2, receiver, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
            });
                        
            it("Mint a license token with waitForTransaction:true", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, 2, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
            });

            it("Mint a license token with the same parameters before", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, 2, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
            });

            it("Mint a license token with undefined waitForTransaction", async function () {
                let waitForTransaction: any;
                const response = await expect(
                    mintLicenseTokens("B", ipIdA, licenseTermsId1, 2, accountB.address, waitForTransaction)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });
        });

        describe("Mint License Tokens - IP asset attached multiple license terms", async function () {
            before("Register 2 license terms and 2 IP assets", async function () {
                const responseAttachLicenseTerms1 = await expect(
                    attachLicenseTerms("A", ipIdB, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms1.txHash).to.be.a("string").and.not.empty;

                const responseAttachLicenseTerms2 = await expect(
                    attachLicenseTerms("A", ipIdB, licenseTermsId2, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms2.txHash).to.be.a("string").and.not.empty;

                const responseAttachLicenseTerms3 = await expect(
                    attachLicenseTerms("A", ipIdB, licenseTermsId3, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms3.txHash).to.be.a("string").and.not.empty;
            })
                        
            it("Mint a license token with ipIdB and licenseTermsId1", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdB, licenseTermsId1, 2, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
            });
                        
            it("Mint a license token with ipIdB and licenseTermsId2", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdB, licenseTermsId2, 2, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
            });
                        
            it("Mint a license token with ipIdB and licenseTermsId3", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdB, licenseTermsId3, 2, accountB.address, false)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.not.be.exist;
            });
        });
    });
});