import { privateKeyA, privateKeyB, privateKeyC, accountB, accountC, nftContractAddress, mintingFeeTokenAddress } from '../../config/config';
import { attachLicenseTerms, registerCommercialUsePIL, registerDerivativeWithLicenseTokens, registerIpAsset, registerNonComSocialRemixingPIL, mintLicenseTokens } from '../../utils/sdkUtils';
import { checkMintResult, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Hex } from 'viem';

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let ipIdA: Hex;
let ipIdB: Hex;
let ipIdC: Hex;
let licenseTermsId1: string;
let licenseTermsId2: string;
let licenseTermsId3: string;
let licenseTokenIdA: string;
let licenseTokenIdB: string;
let licenseTokenIdC: string;
let licenseTokenIdD: string;

describe('SDK Test', function () {
    describe('Test ipAsset.registerDerivativeWithLicenseTokens Function', async function () {
        before("Register license terms, register IP assets and mint license tokens",async function () {
            const licenseTerms1 = await expect(
                registerNonComSocialRemixingPIL("A", true)
            ).to.not.be.rejected;
            licenseTermsId1 = licenseTerms1.licenseTermsId;

            const licenseTerms2 = await expect(
                registerCommercialUsePIL("A", "0", mintingFeeTokenAddress, true)
            ).to.not.be.rejected;
            licenseTermsId2 = licenseTerms2.licenseTermsId;

            const licenseTerms3 = await expect(
                registerCommercialUsePIL("A", "100", mintingFeeTokenAddress, true)
            ).to.not.be.rejected;
            licenseTermsId3 = licenseTerms3.licenseTermsId;

            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);            
            expect(tokenIdA).not.empty;
            
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdB);
            expect(tokenIdB).not.empty;
            
            tokenIdC = await mintNFTWithRetry(privateKeyC);
            checkMintResult(tokenIdC);
            expect(tokenIdC).not.empty;
            
            const responseRegisterIpA = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;

            expect(responseRegisterIpA.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpA.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpA.ipId;
            
            const responseRegisterIpB = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, true)
            ).to.not.be.rejected;

            expect(responseRegisterIpB.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpB.ipId).to.be.a("string").and.not.empty;

            ipIdB = responseRegisterIpB.ipId;
            
            const responseRegisterIpC = await expect(
                registerIpAsset("C", nftContractAddress, tokenIdC, true)
            ).to.not.be.rejected;

            expect(responseRegisterIpC.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpC.ipId).to.be.a("string").and.not.empty;

            ipIdC = responseRegisterIpC.ipId;

            const responseAttachLicenseTerms1 = await expect(
                attachLicenseTerms("A", ipIdA, licenseTermsId1, true)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms1.txHash).to.be.a("string").and.not.empty;

            const responsemintLicenseTokenA = await expect(
                mintLicenseTokens("A", ipIdA, licenseTermsId1, 2, accountB.address, true)
            ).to.not.be.rejected;

            expect(responsemintLicenseTokenA.txHash).to.be.a("string").and.not.empty;
            expect(responsemintLicenseTokenA.licenseTokenId).to.be.a("string").and.not.empty;

            licenseTokenIdA = responsemintLicenseTokenA.licenseTokenId;

            const responseAttachLicenseTerms2 = await expect(
                attachLicenseTerms("A", ipIdA, licenseTermsId2, true)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms2.txHash).to.be.a("string").and.not.empty;

            const responsemintLicenseTokenB = await expect(
                mintLicenseTokens("A", ipIdA, licenseTermsId2, 2, accountB.address, true)
            ).to.not.be.rejected;

            expect(responsemintLicenseTokenB.txHash).to.be.a("string").and.not.empty;
            expect(responsemintLicenseTokenB.licenseTokenId).to.be.a("string").and.not.empty;

            licenseTokenIdB = responsemintLicenseTokenB.licenseTokenId;

            const responsemintLicenseTokenC = await expect(
                mintLicenseTokens("A", ipIdA, licenseTermsId2, 2, accountC.address, true)
            ).to.not.be.rejected;

            expect(responsemintLicenseTokenC.txHash).to.be.a("string").and.not.empty;
            expect(responsemintLicenseTokenC.licenseTokenId).to.be.a("string").and.not.empty;

            licenseTokenIdC = responsemintLicenseTokenC.licenseTokenId;

            const responseAttachLicenseTerms3 = await expect(
                attachLicenseTerms("A", ipIdA, licenseTermsId3, true)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms3.txHash).to.be.a("string").and.not.empty;

            const responsemintLicenseTokenD = await expect(
                mintLicenseTokens("A", ipIdA, licenseTermsId3, 2, accountC.address, true)
            ).to.not.be.rejected;

            expect(responsemintLicenseTokenD.txHash).to.be.a("string").and.not.empty;
            expect(responsemintLicenseTokenD.licenseTokenId).to.be.a("string").and.not.empty;

            licenseTokenIdD = responsemintLicenseTokenD.licenseTokenId;
        });

        it("Register a derivative IP asset fail as non-owner", async function () {
            await expect(
                registerDerivativeWithLicenseTokens("C", ipIdB, [licenseTokenIdA], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted with the following signature:", "0xb3e96921");
        });

        it("Register a derivative IP asset fail as undefined child ipId", async function () {
            let ipIdB: any;
            await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenIdA], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: Address \"undefined\" is invalid.");
        });

        it("Register a derivative IP asset fail as invalid child ipId", async function () {
            await expect(
                registerDerivativeWithLicenseTokens("B", "0x0000", [licenseTokenIdA], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: Address \"0x0000\" is invalid.");
        });

        it("Register a derivative IP asset fail as non-existent child ipId", async function () {
            await expect(
                registerDerivativeWithLicenseTokens("B", "0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a", [licenseTokenIdA], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: Address \"0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a\" is invalid.");
        });

        it("Register a derivative IP asset fail as undefined licenseTokenId", async function () {
            let licenseTokenIdA: any;
            await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenIdA], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: Cannot convert undefined to a BigInt");
        });

        it("Register a derivative IP asset fail as invalid licenseTokenId", async function () {
            await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, ["test"], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: Cannot convert test to a BigInt");
        });

        it("Register a derivative IP asset fail as non-existent licenseTokenId", async function () {
            await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, ["999"], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"ownerOf\" reverted.");
        });

        it("Register a derivative IP asset fail as LicenseTokenNotCompatibleForDerivative", async function () {            
            await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenIdA, licenseTokenIdB], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted.", 
                                 "Error: LicensingModule__LicenseTokenNotCompatibleForDerivative");
        });

        it("Register a derivative IP asset with one license token", async function () {            
            const response = await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenIdA], true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Register a derivative IP asset fail as already registered with the license token", async function () {            
            await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenIdA], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"ownerOf\" reverted.");
        });

        it("Register a derivative IP asset fail as already registered with one of the license tokens", async function () {            
            const response = await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenIdA, licenseTokenIdB], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"ownerOf\" reverted.");
        });

        it("Register a derivative IP asset fail as NotLicenseTokenOwner for one of the license tokens", async function () {            
            const response = await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenIdB, licenseTokenIdC], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted with the following signature:", "0x650aa4f5");
        });

        it("Register a derivative IP asset fail as NotLicenseTokenOwner for all license tokens", async function () {            
            const response = await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenIdC, licenseTokenIdD], true)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted with the following signature:", "0x650aa4f5");
        });

        it("Register a derivative IP asset with multiple license tokens", async function () {            
            const response = await expect(
                registerDerivativeWithLicenseTokens("C", ipIdC, [licenseTokenIdC, licenseTokenIdD], true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });
    });
});