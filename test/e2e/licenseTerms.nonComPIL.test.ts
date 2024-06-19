import { privateKeyA, nftContractAddress, accountA, accountB, privateKeyB } from '../../config/config';
import { attachLicenseTerms, mintLicenseTokens, registerDerivativeIp, registerDerivativeWithLicenseTokens, registerIpAndAttachPilTerms, registerIpAsset } from '../../utils/sdkUtils';
import { getLicenseTokenOwner, mintNFTWithRetry, transferLicenseToken } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Address } from 'viem';
import { PIL_TYPE } from '@story-protocol/core-sdk';

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Address;
let ipIdB: Address;
let licenseTermsId1: bigint;
let licenseTokenId1: bigint;

describe('SDK Test', function () {
    describe.only(`Non-Commercial Social Remixing PIL: "transferable":false, "derivativesAllowed":false`, async function () {
        licenseTermsId1 = 0n;

        before("Wallet A mint a NFT, register an IP asset, attach nonComLicenseTermsId:0 and mint a license token", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            expect(tokenIdA).to.be.a("string").and.not.empty;

            const responseRegisterIpAsset = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;

            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpAsset.ipId;
                        
            const responseAttachLicenseTerms = await expect(
                attachLicenseTerms("A", ipIdA, 0, true)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
            expect(responseAttachLicenseTerms.success).to.be.a("boolean").and.to.be.true;

            const responseMintLicenseTokens = await expect(
                mintLicenseTokens("A", ipIdA, licenseTermsId1, 1, accountB.address, true)
            ).to.not.be.rejected;

            expect(responseMintLicenseTokens.txHash).to.be.a("string").and.not.empty;
            expect(responseMintLicenseTokens.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(1);

            licenseTokenId1 = responseMintLicenseTokens.licenseTokenIds[0];
        })

        // ipAccountExecute to call licenseToken.transferFrom
        // 0xd175f85c - LicenseToken__NotTransferable()
        step(`"transferable":false, cannot transfer licenseTokenId to another account as LicenseToken__NotTransferable()`, async function () {
            await expect(
                transferLicenseToken(privateKeyB, accountB.address, accountA.address, Number(licenseTokenId1))
            ).to.be.rejectedWith(
                `The contract function "transferFrom" reverted with the following signature:`, 
                `0xd175f85c`);
                
            const owner = await expect(
                getLicenseTokenOwner(Number(licenseTokenId1))
            ).to.not.be.rejected;

            expect(owner).to.be.a("string").and.to.be.equal(accountB.address);
        });

        step(`"derivativesAllowed":false, cannot register a derivative IP`, async function () {
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            expect(tokenIdB).to.be.a("string").and.not.empty;

            const responseRegisterIpAsset = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, true)
            ).to.not.be.rejected;

            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

            ipIdB = responseRegisterIpAsset.ipId;

            await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenId1], true)
            ).to.be.rejectedWith(
                `Failed to register derivative with license tokens: The contract function "registerDerivativeWithLicenseTokens" reverted.`,
                `Error: LicensingModule__LicenseTokenNotCompatibleForDerivative(address childIpId, uint256[] licenseTokenIds)`
            );
        });
    });

    describe.only(`Non-Commercial Social Remixing PIL: "transferable":true, "derivativesAllowed":true, "derivativesReciprocal":true`, async function () {
        before(`Wallet A register an IP asset with the nonComLicenseTerms attached (2 - "transferable":true) and mint a license token`, async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            expect(tokenIdA).to.be.a("string").and.not.empty;

            const responseRegisterIpAndAttachPilTerms = await expect(
                registerIpAndAttachPilTerms("A", nftContractAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, true)
            ).to.not.be.rejected;

            expect(responseRegisterIpAndAttachPilTerms.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAndAttachPilTerms.ipId).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAndAttachPilTerms.licenseTermsId).to.be.a("bigint").and.to.be.ok;

            ipIdA = responseRegisterIpAndAttachPilTerms.ipId;
            licenseTermsId1 = responseRegisterIpAndAttachPilTerms.licenseTermsId;

            const responseAttachLicenseTerms = await expect(
                attachLicenseTerms("A", ipIdA, 0n, true)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
            expect(responseAttachLicenseTerms.success).to.be.a("boolean").and.to.be.true;

            const responseMintLicenseTokens = await expect(
                mintLicenseTokens("A", ipIdA, licenseTermsId1, 1, accountA.address, true)
            ).to.not.be.rejected;

            expect(responseMintLicenseTokens.txHash).to.be.a("string").and.not.empty;
            expect(responseMintLicenseTokens.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(1);

            licenseTokenId1 = responseMintLicenseTokens.licenseTokenIds[0];       
        });

        step(`"derivativesAllowed":true & "derivativesReciprocal":true, only can register a derivative with the same license terms as parent IP`, async function () {
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            expect(tokenIdB).to.be.a("string").and.not.empty;

            const response = await expect(
                registerDerivativeIp("B", nftContractAddress, tokenIdB, [ipIdA], [licenseTermsId1], true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdB = response.ipId;
        });

        // 0x1ae3058f LicensingModule__DerivativesCannotAddLicenseTerms()
        step(`"derivativesReciprocal":true, derivative IP cannot add additional license terms`, async function () {
            await expect(
                attachLicenseTerms("B", ipIdB, 0n,true)
            ).to.be.rejectedWith(
                `Failed to attach license terms: The contract function "attachLicenseTerms" reverted with the following signature:`,
                `0x1ae3058f`
            );
        });

        step(`"transferable":true, wallet A can transfer the licenseTokenId to Wallet B`, async function () {
            const response = await expect(
                transferLicenseToken(privateKeyA, accountA.address, accountB.address, Number(licenseTokenId1))
            ).to.not.be.rejected;

            expect(response).to.be.a("string").and.not.empty;

            const owner = await expect(getLicenseTokenOwner(Number(licenseTokenId1))
            ).to.not.be.rejected;

            expect(owner).to.be.a("string").and.to.be.equal(accountB.address);
        });
    });
});
