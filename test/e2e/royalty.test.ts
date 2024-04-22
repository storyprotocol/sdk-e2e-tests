import { privateKeyA, privateKeyB, accountB, privateKeyC, accountC, nftContractAddress, mintingFeeTokenAddress, accountA } from '../../config/config'
import { mintNFTWithRetry, sleep } from '../../utils/utils'
import { registerIpAsset, attachLicenseTerms, registerDerivative, registerCommercialUsePIL, registerCommercialRemixPIL, payRoyaltyOnBehalf, royaltySnapshot, collectRoyaltyTokens, royaltyClaimableRevenue } from '../../utils/sdkUtils'
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
let licenseTokenIdA: string;
let licenseTokenIdB: string;
let snapshotId: number;

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function () {
    describe("Royalty", function () {
        describe.skip("Claim Minting Fee", function () {
            const mintingFee: number = 100;

            before("Register IP Asset and Derivative IP Asset", async function () {
                const responsePolicy = await expect(
                    registerCommercialUsePIL("A", String(mintingFee), mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
    
                licenseTermsId1 = responsePolicy.licenseTermsId;
    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                if (tokenIdA === '') {
                    throw new Error('Unable to mint NFT');
                };
                expect(tokenIdA).not.empty;
    
                const responseRegisterIpAsset = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
                expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;
    
                ipIdA = responseRegisterIpAsset.ipId;
    
                const responseAttachLicenseTerms = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
    
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                if (tokenIdB === '') {
    
                    throw new Error('Unable to mint NFT');
                };
                expect(tokenIdB).not.empty;
    
                const responseregisterIpAssetB = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;
    
                ipIdB = responseregisterIpAssetB.ipId;
    
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
                await sleep(20); 
            });
                        
            step("Get snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A",ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint");

                snapshotId = Number(response.snapshotId);
                console.log(snapshotId)
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, String(snapshotId), mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                console.log(Number(response));
                expect(response).to.be.a("bigint");
                expect(Number(response)).to.be.equal(mintingFee);
            });

            step("Collect royalty tokens", async function () {
                await sleep(30);
                // const response = await expect(
                const response = await
                    collectRoyaltyTokens("B", ipIdA, ipIdB, waitForTransaction)
                console.log(response);
                // ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                // expect(response.royaltyTokensCollected).to.be.a('string').and.not.empty;

                // expect(Number(response.royaltyTokensCollected)).to.be.equal(mintingFee);
            });

            step("Get snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A",ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint");

                snapshotId = Number(response.snapshotId);
                console.log(snapshotId)
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("B", ipIdA, ipIdA, String(snapshotId), mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                console.log(Number(response))
                expect(response).to.be.a("bigint")
                expect(Number(response)).to.be.greaterThanOrEqual(0)
            });
        })

        describe.skip('Pay Royalty On Behalf', async function () {
            let mintingFee: number = 6;
            let payAmount: number = 10;

            before("Register IP Asset and Derivative IP Asset", async function () {
                const responsePolicy = await expect(
                    registerCommercialUsePIL("A", String(mintingFee), mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
    
                licenseTermsId1 = responsePolicy.licenseTermsId;
    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                if (tokenIdA === '') {
                    throw new Error('Unable to mint NFT');
                };
                expect(tokenIdA).not.empty;
    
                const responseRegisterIpAsset = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
                expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;
    
                ipIdA = responseRegisterIpAsset.ipId;
    
                const responseAttachLicenseTerms = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
    
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                if (tokenIdB === '') {
    
                    throw new Error('Unable to mint NFT');
                };
                expect(tokenIdB).not.empty;
    
                const responseregisterIpAssetB = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;
    
                ipIdB = responseregisterIpAssetB.ipId;
    
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
                await sleep(20); 
            });
            
            step("Get snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint");

                snapshotId = Number(response.snapshotId);
                console.log(snapshotId)
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, String(snapshotId), mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                console.log(Number(response))
                expect(response).to.be.a("bigint")
                expect(Number(response)).to.be.equal(mintingFee)
            });

            step("payRoyaltyOnBehalf", async function () {
                const response = await payRoyaltyOnBehalf("B", ipIdA, ipIdB, mintingFeeTokenAddress, BigInt(payAmount), waitForTransaction);
                console.log(response);

                await sleep(20);
            });

            step("Get snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A",ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint");

                snapshotId = Number(response.snapshotId);
                console.log(snapshotId)
            });

            step("Check claimable revenue", async function () {
                // const response = await expect(
                const response = await
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, String(snapshotId), mintingFeeTokenAddress, waitForTransaction)                
                console.log(response)
                    // ).to.not.be.rejected;
                
                console.log(Number(response));
                expect(response).to.be.a("bigint");
                expect(Number(response)).to.be.equal(payAmount);
            });

            step("Collect Royalty Tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("A", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('string').and.not.empty;
            });

            step("Get snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A",ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint");

                snapshotId = Number(response.snapshotId);
                console.log(snapshotId)
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, String(snapshotId), mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                console.log(Number(response));
                expect(response).to.be.a("bigint");
            });
        });

        describe("Claim Minting Fee", function () {
            const mintingFee: number = 10;
            const commercialRevShare: number = 200;

            before("Register IP Asset and Derivative IP Asset", async function () {
                const responsePolicy = await expect(
                    registerCommercialRemixPIL("A", String(mintingFee), commercialRevShare, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
    
                licenseTermsId1 = responsePolicy.licenseTermsId;
    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                if (tokenIdA === '') {
                    throw new Error('Unable to mint NFT');
                };
                expect(tokenIdA).not.empty;
    
                const responseRegisterIpAsset = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
                expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;
    
                ipIdA = responseRegisterIpAsset.ipId;
    
                const responseAttachLicenseTerms = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
    
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                if (tokenIdB === '') {
    
                    throw new Error('Unable to mint NFT');
                };
                expect(tokenIdB).not.empty;
    
                const responseregisterIpAssetB = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;
    
                ipIdB = responseregisterIpAssetB.ipId;
    
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
                await sleep(20); 
            });
                        
            step("Get snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("C",ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint");

                snapshotId = Number(response.snapshotId);
                console.log(snapshotId)
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("C", ipIdA, ipIdA, String(snapshotId), mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                console.log(Number(response));
                expect(response).to.be.a("bigint");
                expect(Number(response)).to.be.equal(mintingFee);
            });

            step("Collect royalty tokens", async function () {
                await sleep(30);
                // const response = await expect(
                const response = await
                    collectRoyaltyTokens("C", ipIdA, ipIdB, waitForTransaction)
                console.log(response);
                // ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                // expect(response.royaltyTokensCollected).to.be.a('string').and.not.empty;

                // expect(Number(response.royaltyTokensCollected)).to.be.equal(mintingFee);
            });

            step("Get snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("C",ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint");

                snapshotId = Number(response.snapshotId);
                console.log(snapshotId)
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("C", ipIdA, ipIdA, String(snapshotId), mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                console.log(Number(response))
                expect(response).to.be.a("bigint")
                expect(Number(response)).to.be.greaterThanOrEqual(0)
            });
        })

        describe.skip('Pay Royalty', async function () {
            let mintingFee: number = 8;
            let payAmount: number = 10;
            let commercialRevShare: number = 100;

            before("Register IP Asset and Derivative IP Asset", async function () {
                const responsePolicy = await expect(
                    registerCommercialRemixPIL("A", String(mintingFee), commercialRevShare, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
    
                licenseTermsId1 = responsePolicy.licenseTermsId;
    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                if (tokenIdA === '') {
                    throw new Error('Unable to mint NFT');
                };
                expect(tokenIdA).not.empty;
    
                const responseRegisterIpAsset = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
                expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;
    
                ipIdA = responseRegisterIpAsset.ipId;
    
                const responseAttachLicenseTerms = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
    
                tokenIdB = await mintNFTWithRetry(privateKeyB);
                if (tokenIdB === '') {
    
                    throw new Error('Unable to mint NFT');
                };
                expect(tokenIdB).not.empty;
    
                const responseregisterIpAssetB = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;
    
                ipIdB = responseregisterIpAssetB.ipId;
    
                const response = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
                await sleep(20); 
            });
            
            step("Get snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint");

                snapshotId = Number(response.snapshotId);
                console.log(snapshotId)
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, String(snapshotId), mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                console.log(Number(response))
                expect(response).to.be.a("bigint")
                expect(Number(response)).to.be.equal(mintingFee)
            });

            step("payRoyaltyOnBehalf", async function () {
                const response = await payRoyaltyOnBehalf("B", ipIdA, ipIdB, mintingFeeTokenAddress, BigInt(payAmount), waitForTransaction);
                console.log(response);

                await sleep(20);
            });

            step("Get snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A",ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint");

                snapshotId = Number(response.snapshotId);
                console.log(snapshotId)
            });

            step("Check claimable revenue", async function () {
                // const response = await expect(
                const response = await
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, String(snapshotId), mintingFeeTokenAddress, waitForTransaction)                
                console.log(response)
                    // ).to.not.be.rejected;
                
                console.log(Number(response));
                expect(response).to.be.a("bigint");
                expect(Number(response)).to.be.equal(payAmount);
            });

            step("Collect Royalty Tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("A", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('string').and.not.empty;
            });

            step("Get snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A",ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("bigint");

                snapshotId = Number(response.snapshotId);
                console.log(snapshotId)
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, String(snapshotId), mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                console.log(Number(response));
                expect(response).to.be.a("bigint");
            });
        });
    });
});
