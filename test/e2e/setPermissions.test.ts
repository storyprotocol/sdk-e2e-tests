import { privateKeyA, accountB, licenseModuleAddress, nftContractAddress, mintingFeeTokenAddress} from '../../config/config';
import { mintNFTWithRetry } from '../../utils/utils';
import { registerNonComSocialRemixingPIL, registerCommercialUsePIL, registerIpAsset, setPermission, attachLicenseTerms } from '../../utils/sdkUtils';
import { expect } from 'chai';
import { Hex } from 'viem';
import '../setup';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Hex;
let ipIdB: Hex;
let licenseTermsId1: string;
let licenseTermsId2: string;

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function () {
    describe("[smoke]Set Permissions", async function () {
        this.beforeAll("Register 2 license terms and 2 IP assets", async function () {
            const responselicenseTerms1 = await expect(
                registerNonComSocialRemixingPIL("A", waitForTransaction)
            ).to.not.be.rejected;
    
            licenseTermsId1 = responselicenseTerms1.licenseTermsId;

            const responselicenseTerms2 = await expect(
                registerCommercialUsePIL("A", "100", mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;
    
            licenseTermsId2 = responselicenseTerms2.licenseTermsId;
                        
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            if (tokenIdA === '') {
                throw new Error('Unable to mint NFT');
            }
            expect(tokenIdA).not.empty;
        
            const responseRegisterIpA = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;
    
            expect(responseRegisterIpA.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpA.ipId).to.be.a("string").and.not.empty;
    
            ipIdA = responseRegisterIpA.ipId;
                        
            tokenIdB = await mintNFTWithRetry(privateKeyA);
            if (tokenIdB === '') {
                throw new Error('Unable to mint NFT');
            }
            expect(tokenIdB).not.empty;
        
            const responseRegisterIpB = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;
    
            expect(responseRegisterIpB.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpB.ipId).to.be.a("string").and.not.empty;
    
            ipIdB = responseRegisterIpB.ipId;
        })

        describe("Set permission - 1 ALLOW", async function (){
            step("Wallet A set permission (permission id: 1) to allow Wallet B to call license Module for ipIdA", async function () {
                const response = await expect(
                    setPermission("A", ipIdA, accountB.address, licenseModuleAddress, 1, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true;
            });

            step("Wallet B can attach licenseTermsId1 to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("B", ipIdA, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Wallet B can NOT attach licenseTermsId1 to ipIdB", async function () {
                const response = await expect(
                    attachLicenseTerms("B", ipIdB, licenseTermsId1, waitForTransaction)
                ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted with the following signature:", "0xb3e96921");
            });
        });
        
        describe("Set permission - 2 DENY", async function (){                            
            step("Wallet A set permission (permission id: 2) to NOT allow Wallet B to call license Module for ipIdA", async function () {
                const response = await expect(
                    setPermission("A", ipIdA, accountB.address, licenseModuleAddress, 2, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true;
            });
            
            step("Wallet B can NOT attach licenseTermsId1 to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("B", ipIdA, licenseTermsId2, waitForTransaction)
                ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted with the following signature:", "0xb3e96921");
            });
        });
        
        describe("Set permission - 0 ABSTAIN", async function (){
            step("Wallet A set permission (permission id: 1) to allow Wallet B to call license Module for ipIdB", async function () {
                const response = await expect(
                    setPermission("A", ipIdB, accountB.address, licenseModuleAddress, 1, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true;
            });

            step("Wallet B can attach licenseTermsId1 to ipIdB", async function () {
                const response = await expect(
                    attachLicenseTerms("B", ipIdB, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });
            
            step("Wallet A set permission (permission id: 0) to NOT allow Wallet B to call license Module for ipIdB", async function () {
                const response = await expect(
                    setPermission("A", ipIdB, accountB.address, licenseModuleAddress, 0, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true;
            });
            
            step("Wallet B can NOT attach licenseTermsId2 to ipIdB", async function () {
                const response = await expect(
                    attachLicenseTerms("B", ipIdB, licenseTermsId2, waitForTransaction)
                ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted with the following signature:", "0xb3e96921");
            });
        });
    });
});
