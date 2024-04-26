import { privateKeyA, privateKeyB, privateKeyC, nftContractAddress, mintingFeeTokenAddress } from '../../config/config'
import { checkMintResult, mintNFTWithRetry, sleep } from '../../utils/utils'
import { registerIpAsset, attachLicenseTerms, registerDerivative, registerCommercialUsePIL, registerCommercialRemixPIL, payRoyaltyOnBehalf, royaltySnapshot, collectRoyaltyTokens, royaltyClaimableRevenue, royaltyClaimRevenue } from '../../utils/sdkUtils'
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
let snapshotId1: string;
let snapshotId2: string;

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function () {
    describe("Royalty", function () {
        describe("Commercial Use PIL - Claim Minting Fee", function () {
            const mintingFee: string = "100";

            before("Register parent and derivative IP assets", async function () {
                const responseLicenseTerm1 = await expect(
                    registerCommercialUsePIL("A", mintingFee, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
    
                licenseTermsId1 = responseLicenseTerm1.licenseTermsId;
    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdA);
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
                checkMintResult(tokenIdB);
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

            step("Capture snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("string").and.not.empty;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response).to.be.a("string").and.not.empty;
                expect(response).to.be.equal(mintingFee);
            });

            step("Claim minting fee", async function () {
                const response = await expect(
                    royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.equal(mintingFee);
            });

            step("Check claimable revenue again", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response).to.be.a("string").and.not.empty;
                expect(response).to.be.equal("0");
            });            
        })

        describe('Commercial Use PIL - Claim Minting Fee and Pay on Behalf', async function () {
            let mintingFee: string = "60";
            let payAmount: string = "100";

            before("Register parent and derivative IP assets", async function () {
                const responseLicenseTerms1 = await expect(
                    registerCommercialUsePIL("A", mintingFee, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
    
                licenseTermsId1 = responseLicenseTerms1.licenseTermsId;
    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdA);
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
                checkMintResult(tokenIdB);
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

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("B", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('string').and.equal("0");
            });
            
            step("Capture snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("string").and.not.empty;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response).to.be.a("string").and.not.empty;
                expect(response).to.be.equal(mintingFee);
            });

            step("Pay royalty on behalf", async function () {
                const response = await expect(
                    payRoyaltyOnBehalf("B", ipIdA, ipIdB, mintingFeeTokenAddress, payAmount, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response.txHash).to.be.a("string").and.not.empty;
                await sleep(20);
            });

            step("Capture snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A",ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("string").and.not.empty;

                snapshotId2 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId2, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(response).to.be.a("string").and.not.empty;;
                expect(response).to.be.equal(payAmount);
            });

            step("Claim revenue", async function () {
                const claimableRevenue = String(Number(mintingFee) + Number(payAmount));
                const response = await expect(
                    royaltyClaimRevenue("A", [snapshotId1, snapshotId2], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                console.log(response);

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.equal(claimableRevenue);
            });

            step("Check claimable revenue again", async function () {
                const responseClaimableRevenue1 = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;

                const responseClaimableRevenue2 = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId2, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;

                expect(responseClaimableRevenue1).to.be.a("string").and.not.empty;
                expect(responseClaimableRevenue1).to.be.equal("0");

                expect(responseClaimableRevenue2).to.be.a("string").and.not.empty;
                expect(responseClaimableRevenue2).to.be.equal("0");
            });
        });

        describe("Commercial Remix PIL - Claim Minting Fee", function () {
            const mintingFee: string = "80";
            const commercialRevShare: number = 200;

            before("Register parent and derivative IP Assets", async function () {
                const responsePolicy = await expect(
                    registerCommercialRemixPIL("A", mintingFee, commercialRevShare, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
    
                licenseTermsId1 = responsePolicy.licenseTermsId;
    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdA);
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
                checkMintResult(tokenIdB);
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

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("A", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('string').and.not.empty;

                expect(Number(response.royaltyTokensCollected)).to.be.equal(commercialRevShare);
            });
                        
            step("Capture snapshotId", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("string").and.not.empty;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response).to.be.a("string").and.not.empty;
                expect(response).to.be.equal(mintingFee);
            });

            step("Claim revenue", async function () {
                const response = await expect(
                    royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.equal(mintingFee);               
            });
                        
            step("Check claimable revenue again", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response).to.be.a("string").and.not.empty;
                expect(response).to.be.equal("0");
            });
        })

        describe('Commercial Remix PIL - Claim Minting Fee and Pay on Behalf', async function () {
            let mintingFee: string = "90";
            let payAmount: string = "600";
            let commercialRevShare: number = 100;

            const claimableRevenue = String(Number(mintingFee) + Number(payAmount));

            before("Register parent and derivative IP assets", async function () {
                const responsePolicy = await expect(
                    registerCommercialRemixPIL("A", mintingFee, commercialRevShare, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
    
                licenseTermsId1 = responsePolicy.licenseTermsId;
    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdA);
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
                checkMintResult(tokenIdB);
                expect(tokenIdB).not.empty;
    
                const responseregisterIpAssetB = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;
    
                ipIdB = responseregisterIpAssetB.ipId;
    
                const responseB = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseB.txHash).to.be.a("string").and.not.empty;
                await sleep(20); 
            });

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("C", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('string').and.equal(String(commercialRevShare));
            });

            step("Capture snapshot", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("string").and.not.empty;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(response).to.be.a("string").and.not.empty;
                expect(response).to.be.equal(mintingFee);
            });

            step("Pay royalty on behalf", async function () {
                const response = await expect(
                    payRoyaltyOnBehalf("C", ipIdA, ipIdB, mintingFeeTokenAddress, payAmount, waitForTransaction)
                ).to.not.be.rejected;
                console.log(response);

                expect(response.txHash).to.be.a("string").and.not.empty;
                await sleep(20);
            });

            step("Capture snapshot", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("string").and.not.empty;

                snapshotId2 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId2, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(response).to.be.a("string").and.not.empty;
                expect(response).to.be.equal(payAmount);
            });

            step("Claim royalty tokens", async function () {
                const response = await expect(               
                    royaltyClaimRevenue("A", [snapshotId1, snapshotId2], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.equal(claimableRevenue);
            })

            step("Check claimable revenue again", async function () {
                const responseClaimableRevenue1 = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;

                const responseClaimableRevenue2 = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId2, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(responseClaimableRevenue1).to.be.a("string").and.not.empty;
                expect(responseClaimableRevenue1).to.be.equal("0");
                
                expect(responseClaimableRevenue2).to.be.a("string").and.not.empty;
                expect(responseClaimableRevenue2).to.be.equal("0");
            });
        });

        describe('Royalty - Derivative and Re-inherited IP Assets', async function () {
            let mintingFee: string = "120";
            let payAmount: string = "800";
            let commercialRevShare: number = 160;

            const claimableRevenue = String(Number(mintingFee) + Number(payAmount));

            before("Register parent and derivative IP assets", async function () {
                const responsePolicy = await expect(
                    registerCommercialRemixPIL("A", mintingFee, commercialRevShare, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
    
                licenseTermsId1 = responsePolicy.licenseTermsId;
    
                tokenIdA = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdA);
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
                checkMintResult(tokenIdB);
                expect(tokenIdB).not.empty;
    
                const responseregisterIpAssetB = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;
    
                ipIdB = responseregisterIpAssetB.ipId;
    
                const responseB = await expect(
                    registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseB.txHash).to.be.a("string").and.not.empty;
    
                tokenIdC = await mintNFTWithRetry(privateKeyC);
                checkMintResult(tokenIdC);
                expect(tokenIdC).not.empty;
    
                const responseregisterIpAssetC = await expect(
                    registerIpAsset("C", nftContractAddress, tokenIdC, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseregisterIpAssetC.txHash).to.be.a("string").and.not.empty;
                expect(responseregisterIpAssetC.ipId).to.be.a("string").and.not.empty;
    
                ipIdC = responseregisterIpAssetC.ipId;
    
                const responseC = await expect(
                    registerDerivative("C", ipIdC, [ipIdB], [licenseTermsId1], waitForTransaction)
                ).to.not.be.rejected;
    
                expect(responseC.txHash).to.be.a("string").and.not.empty;
                await sleep(20); 
            });

            step("Pay royalty on behalf", async function () {
                const response = await expect(
                    payRoyaltyOnBehalf("C", ipIdB, ipIdC, mintingFeeTokenAddress, payAmount, waitForTransaction)
                ).to.not.be.rejected;
                console.log(response);

                expect(response.txHash).to.be.a("string").and.not.empty;
                await sleep(20);
            });

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("C", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('string').and.equal(String(commercialRevShare));
            });

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("C", ipIdB, ipIdC, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a('string').and.equal(String(commercialRevShare));
            });

            step("Capture snapshot", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.snapshotId).to.be.a("string").and.not.empty;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(response).to.be.a("string").and.not.empty;
                expect(response).to.be.equal(mintingFee);
            });

            step("Claim royalty tokens", async function () {
                const response = await expect(               
                    royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.equal(mintingFee);
            })

            step("Check claimable revenue again", async function () {
                const responseClaimableRevenue1 = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)                
                ).to.not.be.rejected;
                
                expect(responseClaimableRevenue1).to.be.a("string").and.not.empty;
                expect(responseClaimableRevenue1).to.be.equal("0");
            });
        });
    });
});
