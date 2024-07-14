import { privateKeyA, nftContractAddress, accountA, accountB, privateKeyB } from '../../config/config';
import { attachLicenseTerms, mintLicenseTokens, registerDerivativeIp, registerDerivativeWithLicenseTokens, registerIpAsset } from '../../utils/sdkUtils';
import { getLicenseTokenOwner, mintNFTWithRetry, transferLicenseToken } from '../../utils/utils';
import { expect } from 'chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Address } from 'viem';

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Address;
let ipIdB: Address;
let licenseTermsId1: bigint;
let licenseTokenId1: bigint;

describe('SDK E2E Test', function () {
    describe(`Non-Commercial Social Remixing PIL: "transferable":false, "derivativesAllowed":false`, async function () {
        licenseTermsId1 = 0n;

        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            expect(tokenIdA).to.be.a("string").and.not.empty;
        });

        step("Wallet A register an IP Asset with tokenIdA and get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;
        });

        step("Wallet A attach the non-commercial social remixing PIL(licenseTermsId:0 - transferable:false) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, 0n, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.success).to.be.a("boolean").and.to.be.true;
        });

        step("Wallet A mint a license token with the receiverAddress set as Wallet B, get a licenseTokenId (licenseTokenId1)", async function () {
            const response = await expect(
                mintLicenseTokens("A", ipIdA, 0n, 1, accountB.address, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(1);

            licenseTokenId1 = response.licenseTokenIds[0];
        });

        step(`"transferable":false, 1 - check the owner of licenseTokenId1`, async function () {
            const response = await expect(
                getLicenseTokenOwner(Number(licenseTokenId1))
            ).to.not.be.rejected;

            expect(response).to.be.a("string").and.to.be.equal(accountB.address);
        });

        // ipAccountExecute to call licenseToken.transferFrom
        // 0xd175f85c - LicenseToken__NotTransferable()
        step(`"transferable":false, 2 - WalletB cannot transfer licenseTokenId to WalletA as LicenseToken__NotTransferable()`, async function () {
            const errorMessage = `The contract function "transferFrom" reverted with the following signature:`;
            const errorCode = `0xd175f85c`;
            await expect(
                transferLicenseToken(privateKeyB, accountB.address, accountA.address, Number(licenseTokenId1))
            ).to.be.rejectedWith(errorMessage, errorCode);
            console.log(`${errorMessage} ${errorCode}`);            
        });
            
        step(`"transferable":false, 3 - check the owner of licenseTokenId1 again`, async function () {
            const owner = await expect(
                getLicenseTokenOwner(Number(licenseTokenId1))
            ).to.not.be.rejected;

            expect(owner).to.be.a("string").and.to.be.equal(accountB.address);            
        });

        step(`"derivativesAllowed":false, cannot register an IP asset as licenseTokenId1's derivative as LicenseTokenNotCompatibleForDerivative`, async function () {
            const errorMessage = `Failed to register derivative with license tokens: The contract function "registerDerivativeWithLicenseTokens" reverted.`;
            const errorReason = `Error: LicensingModule__LicenseTokenNotCompatibleForDerivative(address childIpId, uint256[] licenseTokenIds)`;

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
            ).to.be.rejectedWith(errorMessage, errorReason);
            console.log(`${errorMessage} ${errorReason}`);
        });
    });

    describe(`Non-Commercial Social Remixing PIL: "transferable":true, "derivativesAllowed":true, "derivativesReciprocal":true`, async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            expect(tokenIdA).to.be.a("string").and.not.empty;
        });

        step(`Wallet A register an IP Asset and default attach the non-commercial remixing PIL(licenseTermsId:2 - "transferable":true"), get an ipId (ipIdA) and a licenseTermsId (licenseTermsId1)`, async function () {
            const responseRegisterIpAsset = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;

            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpAsset.ipId;
            licenseTermsId1 = 2n;
        });

        step("Wallet A attach another non-commercial social remixing PIL(licenseTermsId:0) to ipIdA", async function () {
            const responseAttachLicenseTerms = await expect(
                attachLicenseTerms("A", ipIdA, 0n, true)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
            expect(responseAttachLicenseTerms.success).to.be.a("boolean").and.to.be.true;
        });
        
        step(`Wallet A mint a license token with ipIdA and licenseTermsId1, get a licenseTokenId (licenseTokenId1)`, async function () {
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
            const errorMessage = `The contract function "attachLicenseTerms" reverted with the following signature:`;
            const errorCode = `0x1ae3058f`;

            await expect(
                attachLicenseTerms("B", ipIdB, 0n,true)
            ).to.be.rejectedWith(
                `Failed to attach license terms: The contract function "attachLicenseTerms" reverted with the following signature:`,
                `0x1ae3058f`
            );

            console.log(`${errorMessage} ${errorCode}`);
        });

        step(`"transferable":true, 1 - check the owner of licenseTokenId1`, async function () {
            const response = await expect(getLicenseTokenOwner(Number(licenseTokenId1))
            ).to.not.be.rejected;

            expect(response).to.be.a("string").and.to.be.equal(accountA.address);
        });

        step(`"transferable":true, 2 - wallet A can transfer the licenseTokenId to Wallet B`, async function () {
            const response = await expect(
                transferLicenseToken(privateKeyA, accountA.address, accountB.address, Number(licenseTokenId1))
            ).to.not.be.rejected;

            expect(response).to.be.a("string").and.not.empty;
        });

        step(`"transferable":true, 3 - check the owner of licenseTokenId1 again`, async function () {
            const response = await expect(getLicenseTokenOwner(Number(licenseTokenId1))
            ).to.not.be.rejected;

            expect(response).to.be.a("string").and.to.be.equal(accountB.address);
        });
    });
});
