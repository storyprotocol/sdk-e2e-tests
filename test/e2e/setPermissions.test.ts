import { accountA, accountB, privateKeyA, licenseModuleAddress, nftContractAddress} from '../../config/config';
import { mintNFTWithRetry } from '../../utils/utils';
import { mintLicenseTokens, registerIpAsset, setPermission, registerNonComSocialRemixingPIL, attachLicenseTerms } from '../../utils/sdkUtils';
import { expect } from 'chai';
import { Hex } from 'viem';
import '../setup';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

let tokenIdA: string;
let ipIdA: Hex;
let licenseTermsId1: string;

const waitForTransaction: boolean = true;


describe('SDK E2E Test', function () {
    describe("[smoke]Set Permissions Functions", async function () {
        before("Create non-commercial social remixing PIL",async function () {
            const responsePolicy = await expect(
                registerNonComSocialRemixingPIL("A", waitForTransaction)
            ).to.not.be.rejected;
    
            licenseTermsId1 = responsePolicy.licenseTermsId;        
        })

        describe("Set permission - 1 ALLOW", async function (){
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                if (tokenIdA === '') {
                    throw new Error('Unable to mint NFT');
                }
                expect(tokenIdA).not.empty;                
            });
        
            step("Wallet A register a root IP Asset and get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty.and.not.empty;
        
                ipIdA = response.ipId;
            });

            step("Wallet A attach licenseTermsId1(non-commercial social remixing PIL) to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });
        
            step("Wallet A set permission to allow Wallet B to call license Module", async function () {
                const response = await expect(
                    setPermission("A", ipIdA, accountB.address, licenseModuleAddress, 1, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true;
            });
        
            step("Wallet B can mint a license token with ipIdA", async function () {
                const response = await expect(
                    mintLicenseTokens("B", ipIdA, licenseTermsId1, 2, accountA.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
            });
        });
        
        describe("Set permission - 2 DENY", async function (){
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                if (tokenIdA === '') {
                    throw new Error('Unable to mint NFT');
                }
                expect(tokenIdA).not.empty;
            });
        
            step("Wallet A register a root IP asset and get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;
        
                ipIdA = response.ipId;
            });

            step("Wallet A attach licenseTermsId1(non-commercial social remixing PIL) to ipIdA", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });
        
            step("Wallet A set permission to NOT allow Wallet B to call license Module", async function () {
                const response = await expect(
                    setPermission("A", ipIdA, accountB.address, licenseModuleAddress, 2, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true;
            });
            
            step("Wallet B can NOT mint a license token with ipIdA", async function () {
                const response = await expect(
                    mintLicenseTokens("B", ipIdA, licenseTermsId1, 1, accountA.address, waitForTransaction)
                ).to.be.rejectedWith("Failed to mint license: The contract function \"mintLicense\" reverted.",
                                     "Error: LicensingModule__CallerNotLicensorAndPolicyNotSet()");
            });
        });
    });
});