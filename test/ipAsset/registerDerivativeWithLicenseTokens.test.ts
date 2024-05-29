import { privateKeyA, privateKeyB, privateKeyC, accountB, accountC, nftContractAddress } from '../../config/config';
import { attachLicenseTerms, registerDerivativeWithLicenseTokens, registerIpAsset, mintLicenseTokens } from '../../utils/sdkUtils';
import { checkMintResult, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { nonComLicenseTermsId, comUseLicenseTermsId1, comUseLicenseTermsId2 } from '../setup';
import { Address } from 'viem';

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let ipIdA: Address;
let ipIdB: Address;
let ipIdC: Address;
let licenseTokenIdA: bigint;
let licenseTokenIdB: bigint;
let licenseTokenIdC: bigint;
let licenseTokenIdD: bigint;

describe('SDK Test', function () {
    describe('Test ipAsset.registerDerivativeWithLicenseTokens Function', async function () {
        before("Register license terms, register IP assets and mint license tokens",async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);            
            
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdB);
            
            tokenIdC = await mintNFTWithRetry(privateKeyC);
            checkMintResult(tokenIdC);
            
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
                attachLicenseTerms("A", ipIdA, nonComLicenseTermsId, true)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms1.txHash).to.be.a("string").and.not.empty;

            const responsemintLicenseTokenA = await expect(
                mintLicenseTokens("A", ipIdA, nonComLicenseTermsId, 2, accountB.address, true)
            ).to.not.be.rejected;

            expect(responsemintLicenseTokenA.txHash).to.be.a("string").and.not.empty;
            expect(responsemintLicenseTokenA.licenseTokenId).to.be.a("bigint").and.to.be.ok;

            licenseTokenIdA = responsemintLicenseTokenA.licenseTokenId;

            const responseAttachLicenseTerms2 = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, true)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms2.txHash).to.be.a("string").and.not.empty;

            const responsemintLicenseTokenB = await expect(
                mintLicenseTokens("A", ipIdA, comUseLicenseTermsId1, 2, accountB.address, true)
            ).to.not.be.rejected;

            expect(responsemintLicenseTokenB.txHash).to.be.a("string").and.not.empty;
            expect(responsemintLicenseTokenB.licenseTokenId).to.be.a("bigint").and.to.be.ok;

            licenseTokenIdB = responsemintLicenseTokenB.licenseTokenId;

            const responsemintLicenseTokenC = await expect(
                mintLicenseTokens("A", ipIdA, comUseLicenseTermsId1, 2, accountC.address, true)
            ).to.not.be.rejected;

            expect(responsemintLicenseTokenC.txHash).to.be.a("string").and.not.empty;
            expect(responsemintLicenseTokenC.licenseTokenId).to.be.a("bigint").and.to.be.ok;

            licenseTokenIdC = responsemintLicenseTokenC.licenseTokenId;

            const responseAttachLicenseTerms3 = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId2, true)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms3.txHash).to.be.a("string").and.not.empty;

            const responsemintLicenseTokenD = await expect(
                mintLicenseTokens("A", ipIdA, comUseLicenseTermsId2, 2, accountC.address, true)
            ).to.not.be.rejected;

            expect(responsemintLicenseTokenD.txHash).to.be.a("string").and.not.empty;
            expect(responsemintLicenseTokenD.licenseTokenId).to.be.a("bigint").and.to.be.ok;

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
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The child IP with id 0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a is not registered.");
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

        // 0xd474000f - LicenseToken__NotLicenseTokenOwner(uint256,address,address)
        it("Register a derivative IP asset fail as non-existent licenseTokenId", async function () {
            await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, ["999"], true)
            ).to.be.rejectedWith(`Failed to register derivative with license tokens: The contract function "registerDerivativeWithLicenseTokens" reverted with the following signature:`, `0xd474000f`);
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