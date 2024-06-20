import { privateKeyA, privateKeyB, nftContractAddress } from '../../config/config';
import { attachLicenseTerms, registerDerivative, registerIpAsset } from '../../utils/sdkUtils';
import { checkMintResult, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Address } from 'viem';
import { nonComLicenseTermsId, comUseLicenseTermsId1 } from '../setup';

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Address;
let ipIdB: Address;

describe('SDK Test', function () {
    describe('Test ipAsset.registerDerivative Function', async function () {
        before("Register license terms, mint NFTs and register IP assets",async function () {
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
                registerDerivative("C", ipIdB, [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith("Failed to register derivative: License terms id " + nonComLicenseTermsId + " must be attached to the parent ipId " + ipIdA + " before registering derivative.");
        });

        it("Register a derivative IP asset fail as no license terms attached", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, nonComLicenseTermsId, true)
            ).to.not.be.rejected;
            expect(response.txHash).to.be.a("string").and.not.empty;
            
            await expect(
                registerDerivative("C", ipIdB, [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted with the following signature:", "0xb3e96921");
        });

        it("Register a derivative IP asset fail as undefined child ipId", async function () {
            let ipIdB: any;
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative: ipId address is invalid: undefined, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Register a derivative IP asset fail as invalid child ipId", async function () {
            await expect(
                registerDerivative("B", "0x0000", [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative: ipId address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Register a derivative IP asset fail as non-existent child ipId", async function () {
            await expect(
                registerDerivative("B", "0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a", [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith("Failed to register derivative: The child IP with id 0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a is not registered.");
        });

        it("Register a derivative IP asset fail as undefined parent ipId", async function () {
            let ipIdA: any;
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative: request.parentIpIds address is invalid: undefined, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Register a derivative IP asset fail as invalid parent ipId", async function () {
            await expect(
                registerDerivative("B", ipIdB, ["0x0000"], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative: request.parentIpIds address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Register a derivative IP asset fail as non-existent parent ipId", async function () {
            await expect(
                registerDerivative("B", ipIdB, ["0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a"], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith("Failed to register derivative: The parent IP with id 0x485FCfC79Ce0A082Ab2a5e729D6e6255A540342a is not registered.");
        });

        it("Register a derivative IP asset fail as undefined licenseTermsId", async function () {
            let nonComLicenseTermsId: any;
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], [nonComLicenseTermsId], true)
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
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], [nonComLicenseTermsId, comUseLicenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: Parent IP IDs and License terms IDs must be provided in pairs.");
        });

        it("Register a derivative IP asset fail as LicenseNotCompatibleForDerivative", async function () {            
            await expect(
                registerDerivative("B", ipIdB, [ipIdA, ipIdA], [nonComLicenseTermsId, comUseLicenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", 
                                 "Error: LicensingModule__LicenseNotCompatibleForDerivative(address childIpId)");
        });

        it("Register a derivative IP asset success", async function () {            
            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA], [nonComLicenseTermsId], true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Register a derivative IP asset fail as DerivativeIpAlreadyHasLicense", async function () {            
            await expect(
                registerDerivative("B", ipIdB, [ipIdA], [comUseLicenseTermsId1], true)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted with the following signature:", "0x650aa4f5");
        });

        it("Register a derivative IP asset that is already registered with same parent ipId and licenseTermsId", async function () {            
            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted with the following signature:", "0x650aa4f5");
        });
    });
});
