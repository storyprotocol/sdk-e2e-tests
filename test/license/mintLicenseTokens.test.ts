import { privateKeyA, accountB, nftContractAddress } from '../../config/config';
import { attachLicenseTerms, mintLicenseTokens, registerIpAsset } from '../../utils/sdkUtils';
import { checkMintResult, mintNFT, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Address } from 'viem';
import { nonComLicenseTermsId, comUseLicenseTermsId1, comRemixLicenseTermsId1 } from '../setup';

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Address;
let ipIdB: Address;

const waitForTransaction: boolean = true;

describe('SDK Test', function () {
    describe('Test license.mintLicenseTokens Function', async function () {
        before("Register license terms and IP assets",async function () {
            tokenIdA = await mintNFT(privateKeyA);
            checkMintResult(tokenIdA);

            tokenIdB = await mintNFT(privateKeyA);
            checkMintResult(tokenIdB);

            const responseA = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseA.txHash).to.be.a("string").and.not.empty;
            expect(responseA.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseA.ipId;

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
                    mintLicenseTokens("A", ipIdA, nonComLicenseTermsId, 2, accountB.address, true)      
                ).to.be.rejectedWith(`Failed to mint license tokens: request.licensorIpId address is invalid: undefined, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
            });

            it("Mint a license token fail as invalid ipId", async function () {
                const response = await expect(
                    mintLicenseTokens("A", "0x0000", nonComLicenseTermsId, 2, accountB.address, true)      
                ).to.be.rejectedWith(`Failed to mint license tokens: request.licensorIpId address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
            });

            it("Mint a license token fail as non-existent ipId", async function () {
                const response = await expect(
                    mintLicenseTokens("A", "0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAB", nonComLicenseTermsId, 2, accountB.address, true)      
                ).to.be.rejectedWith("Failed to mint license tokens: The licensor IP with id 0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAB is not registered.");
            });

            it("Mint a license token fail as undefined licenseTermsId", async function () {
                let nonComLicenseTermsId: any;
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, nonComLicenseTermsId, 2, accountB.address, true)      
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
                    mintLicenseTokens("A", ipIdA, nonComLicenseTermsId, -1, receiver, true)      
                ).to.be.rejectedWith("Failed to mint license tokens: Number \"-1n\" is not in safe 256-bit unsigned integer range (0n to 115792089237316195423570985008687907853269984665640564039457584007913129639935n)");
            });

            it("Mint a license token fail as invalid receiver address", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, nonComLicenseTermsId, 2, "0x0000", true)      
                ).to.be.rejectedWith(`Failed to mint license tokens: request.receiver address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
            });

            it("Mint a license token fail as not attached licenseTermsId", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdB, 0n, 2, "0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a", true)      
                ).to.be.rejectedWith("Failed to mint license tokens: License terms id 0 is not attached to the IP with id " + ipIdB);
            });
        });

        describe("Mint License Tokens - Positive Tests", async function () {
            it("Mint a license token with undefined amount", async function () {
                let amount: any;
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, nonComLicenseTermsId, amount, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(1);
            });

            it("Mint a license token with amount: 0", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, nonComLicenseTermsId, 0, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(1);
            });
            
            it("Mint a license token by non-owner", async function () {
                const response = await expect(
                    mintLicenseTokens("B", ipIdA, nonComLicenseTermsId, 2, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);
            });
                        
            it("Mint a license token with undefined receiver address", async function () {
                let receiver: any;
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, nonComLicenseTermsId, 2, receiver, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);
            });
                        
            it("Mint a license token with waitForTransaction:true", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, nonComLicenseTermsId, 2, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);
            });

            it("Mint a license token with the same parameters before", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, nonComLicenseTermsId, 2, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);
            });

            it("Mint a license token with undefined waitForTransaction", async function () {
                let waitForTransaction: any;
                const response = await expect(
                    mintLicenseTokens("B", ipIdA, nonComLicenseTermsId, 2, accountB.address, waitForTransaction)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });
        });

        describe("Mint License Tokens - IP asset attached multiple license terms", async function () {
            before("Register 2 license terms and 2 IP assets", async function () {
                const responseAttachLicenseTerms1 = await expect(
                    attachLicenseTerms("A", ipIdB, comUseLicenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms1.txHash).to.be.a("string").and.not.empty;

                const responseAttachLicenseTerms2 = await expect(
                    attachLicenseTerms("A", ipIdB, comRemixLicenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms2.txHash).to.be.a("string").and.not.empty;
            });
                        
            it("Mint a license token with ipIdB and nonComLicenseTermsId", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdB, nonComLicenseTermsId, 2, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);
            });
                        
            it("Mint a license token with ipIdB and comUsenonComLicenseTermsId", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdB, comUseLicenseTermsId1, 2, accountB.address, true)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);
            });
                        
            it("Mint a license token with ipIdB and comRemixnonComLicenseTermsId", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdB, comRemixLicenseTermsId1, 2, accountB.address, false)      
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.not.be.exist;
            });
        });
    });
});
