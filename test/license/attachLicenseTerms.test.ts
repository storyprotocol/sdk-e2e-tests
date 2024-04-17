import { privateKeyA, nftContractAddress } from '../../config/config';
import { mintNFTWithRetry } from '../../utils/utils';
import { Hex } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { registerNonComSocialRemixingPIL, registerIpAsset, attachLicenseTerms } from '../../utils/sdkUtils';

let licenseTermsId1: string;
let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Hex;
let ipIdB: Hex;

describe("SDK Test", function () {
    describe("Attach License Terms", async function () {
        before("Create 2 policies with parameter derivativesAllowed: true and false", async function () {
            const responsePolicy1 = await expect(
                registerNonComSocialRemixingPIL("A", true)
            ).to.not.be.rejected;
            licenseTermsId1 = responsePolicy1.licenseId;

            tokenIdA = await mintNFTWithRetry(privateKeyA);
            if (tokenIdA === '') {
                throw new Error('Unable to mint NFT');
            };

            tokenIdB = await mintNFTWithRetry(privateKeyA);
            if (tokenIdB === '') {
                throw new Error('Unable to mint NFT');
            };

            const responseA = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;
            ipIdA = responseA.ipId;

            const responseB = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdB, true)
            ).to.not.be.rejected;
            ipIdB = responseB.ipId;
        });

        it("Non-owner attach license terms", async function () {
            const response = await expect(
                attachLicenseTerms("B", ipIdA, licenseTermsId1, true)
            ).to.be.rejectedWith("The contract function \"attachLicenseTerms\" reverted.",
                                 "Error: AccessController__PermissionDenied");   
        });

        it("Attach license terms with ipId: undefined", async function () {
            let ipId: any;
            const response = await expect(
                attachLicenseTerms("A", ipId, "6", true)
            ).to.be.rejectedWith("Address \"undefined\" is invalid.");
        });

        it("Attach license terms with an invalid ipId", async function () {
            const response = await expect(
                attachLicenseTerms("A", "0x0000", "6", true)
            ).to.be.rejectedWith("Address \"0x0000\" is invalid.")
        });

        it("Attach license terms with a non-existent ipId", async function () {
            const response = await expect(
                attachLicenseTerms("A", "0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAB", "6", true)
            ).to.be.rejectedWith("Address \"0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAB\" is invalid.")
        });

        it("Attach license terms with licenseTermsId: undefined", async function () {
            let licenseTermsId: any;
            const response = await expect(
                attachLicenseTerms("A", ipIdA, licenseTermsId, true)
            ).to.be.rejectedWith("Cannot convert undefined to a BigInt")
        });

        it("Attach license terms with an invalid licenseTermsId", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, "test", true)
            ).to.be.rejectedWith("Cannot convert test to a BigInt")
        });

        it("Attach license terms with a non-existent licenseTermsId", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, "999999", true)
            ).to.be.rejectedWith("The contract function \"attachLicenseTerms\" reverted.", 
                                 "Error: LicensingModule__LicenseTermsNotFound")
        });

        describe("Attach license terms successfully", async function () {
            step("Attach license terms with waitForTransaction: undefined", async function () {
                let waitForTransaction: any;
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
                expect(response.txHash).to.be.a("string").and.not.empty;
            });
    
            step("Attach license terms with waitForTransaction: true", async function () {
                // const response = await expect(
                const response = await
                    attachLicenseTerms("A", ipIdB, licenseTermsId1, true)
                console.log(JSON.stringify(response));
                // ).to.not.be.rejected;
            });
    
            step("Attach license terms with waitForTransaction: false", async function () {
                // const response = await expect(
                const response = await
                    attachLicenseTerms("A", ipIdB, licenseTermsId1, false)
                console.log(JSON.stringify(response));
                // ).to.not.be.rejected;
            });            
        });
    });
});