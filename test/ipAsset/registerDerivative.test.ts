import { nftContractAddress, privateKeyA, privateKeyB, mintingFeeTokenAddress } from '../../config/config';
import { attachLicenseTerms, registerCommercialUsePIL, registerDerivative, registerIpAsset, registerNonComSocialRemixingPIL } from '../../utils/sdkUtils';
import { checkMintResult, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Hex } from 'viem';

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Hex;
let ipIdB: Hex;
let licenseTermsId1: string;
let licenseTermsId2: string;

describe('SDK Test', function () {
    describe('Test ipAsset.registerDerivative Function', async function () {
        before("Register license terms, mint NFTs and register IP assets",async function () {
            const licenseTerms1 = await expect(
                registerNonComSocialRemixingPIL("A", true)
            ).to.not.be.rejected;
            licenseTermsId1 = licenseTerms1.licenseTermsId;

            const licenseTerms2 = await expect(
                registerCommercialUsePIL("A", "0", mintingFeeTokenAddress, true)
            ).to.not.be.rejected;
            licenseTermsId2 = licenseTerms2.licenseTermsId;

            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);            
            expect(tokenIdA).not.empty;
            
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdB);
            expect(tokenIdB).not.empty;
            
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
        });

        it("Register a derivative IP asset fail as no license terms attached", async function () {
            await expect(
                registerDerivative("C", ipIdB, [ipIdA], [licenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: License terms id " + licenseTermsId1 + " must be attached to the parent ipId " + ipIdA + " before registering derivative.");
        });

        it("Register a derivative IP asset fail as no license terms attached", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, licenseTermsId1, true)
            ).to.not.be.rejected;
            expect(response.txHash).to.be.a("string").and.not.empty;
            
            await expect(
                registerDerivative("C", ipIdB, [ipIdA], [licenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted with the following signature:", "0xb3e96921");
        });

        it("Register a derivative IP asset fail as undefined child ipId", async function () {
            let ipIdB: any;
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: Address \"undefined\" is invalid.");
        });

        it("Register a derivative IP asset fail as invalid child ipId", async function () {
            await expect(
                registerDerivative("B", "0x0000", [ipIdA], [licenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: Address \"0x0000\" is invalid.");
        });

        it("Register a derivative IP asset fail as non-existent child ipId", async function () {
            await expect(
                registerDerivative("B", "0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a", [ipIdA], [licenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: Address \"0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a\" is invalid.");
        });

        it("Register a derivative IP asset fail as undefined parent ipId", async function () {
            let ipIdA: any;
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: Address \"undefined\" is invalid.");
        });

        it("Register a derivative IP asset fail as invalid parent ipId", async function () {
            await expect(
                registerDerivative("B", ipIdB, ["0x0000"], [licenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: Address \"0x0000\" is invalid.");
        });

        it("Register a derivative IP asset fail as non-existent parent ipId", async function () {
            await expect(
                registerDerivative("B", ipIdB, ["0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a"], [licenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: Address \"0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a\" is invalid.");
        });

        it("Register a derivative IP asset fail as undefined licenseTermsId", async function () {
            let licenseTermsId1: any;
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: Cannot convert undefined to a BigInt");
        });

        it("Register a derivative IP asset fail as invalid licenseTermsId", async function () {
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], ["test"], true)
            ).to.be.rejectedWith("Failed to register derivative: Cannot convert test to a BigInt");
        });

        it("Register a derivative IP asset fail as non-existent licenseTermsId", async function () {
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], ["999"], true)
            ).to.be.rejectedWith("Failed to register derivative: License terms id 999 must be attached to the parent ipId " + ipIdA + " before registering derivative.");
        });

        it("Register a derivative IP asset fail as parent id and licenseTermsId not in pairs", async function () {
            const response= await expect(
                attachLicenseTerms("A", ipIdA, licenseTermsId2, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1, licenseTermsId2], true)
            ).to.be.rejectedWith("Failed to register derivative: Parent IP IDs and License terms IDs must be provided in pairs.");
        });

        it("Register a derivative IP asset fail as LicenseNotCompatibleForDerivative", async function () {            
            await expect(
                registerDerivative("B", ipIdB, [ipIdA, ipIdA], [licenseTermsId1, licenseTermsId2], true)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", 
                                 "Error: LicensingModule__LicenseNotCompatibleForDerivative(address childIpId)");
        });

        it("Register a derivative IP asset success", async function () {            
            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Register a derivative IP asset fail as DerivativeIpAlreadyHasLicense", async function () {            
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId2], true)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted with the following signature:", "0x650aa4f5");
        });

        it("Register a derivative IP asset that is already registered with same parent ipId and licenseTermsId", async function () {            
            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted with the following signature:", "0x650aa4f5");
        });
    });
});