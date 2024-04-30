import { privateKeyA, privateKeyB, accountB, nftContractAddress, arbitrationPolicyAddress, mintingFeeTokenAddress } from '../../config/config';
import { mintNFTWithRetry, checkMintResult, sleep } from '../../utils/utils';
import { registerIpAsset, raiseDispute, registerNonComSocialRemixingPIL, attachLicenseTerms, registerCommercialUsePIL, registerCommercialRemixPIL, mintLicenseTokens, registerDerivativeWithLicenseTokens, payRoyaltyOnBehalf, collectRoyaltyTokens, royaltySnapshot, royaltyClaimableRevenue, royaltyClaimRevenue, registerDerivative } from '../../utils/sdkUtils';
import { Hex } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';

const waitForTransaction: boolean = true;

let tokenIdA: string;
let ipIdA: Hex;
let ipIdB: Hex;
let licenseTermsId1: string;
let licenseTermsId2: string;
let licenseTermsId3: string;
let licenseTokenId3: string;
const mintingFee1: string = "60";
const mintingFee2: string = "100";
const commercialRevShare: number = 200;

describe("SDK Test", function () {
    describe("IP Asset is IN_DISPUTE", async function () {
        before("Register license terms and IP assets, raise dispute", async function () {
            const responseLicenseTerms1 = await expect(
                registerNonComSocialRemixingPIL("A", waitForTransaction)
            ).to.not.be.rejected;

            expect(responseLicenseTerms1.licenseTermsId).to.be.a("string").and.not.empty;

            licenseTermsId1 = responseLicenseTerms1.licenseTermsId;

            const responseLicenseTerms2 = await expect(
                registerCommercialUsePIL("A", mintingFee1, mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseLicenseTerms2.licenseTermsId).to.be.a("string").and.not.empty;

            licenseTermsId2 = responseLicenseTerms2.licenseTermsId;

            const responseLicenseTerms3 = await expect(
                registerCommercialRemixPIL("A", mintingFee2, commercialRevShare, mintingFeeTokenAddress, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseLicenseTerms3.licenseTermsId).to.be.a("string").and.not.empty;

            licenseTermsId3 = responseLicenseTerms3.licenseTermsId;

            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);
            expect(tokenIdA).not.empty;

            const responseRegisterIpAsset = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpAsset.ipId;

            const responseRaiseDispute = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRaiseDispute.txHash).to.be.a("string").and.not.empty;
            expect(responseRaiseDispute.disputeId).to.be.a("string").and.not.empty;
        });

        describe("Attach License Terms to IN_DISPUTE IP Asset", async function () {
            it("Attach non-commerical social remixing PIL to an IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
            });
    
            it("Attach commercial use PIL to an IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId2, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
            });
    
            it("Attach commericial remix PIL to an IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, licenseTermsId3, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
            });            
        });

        describe("Mint License Tokens", async function () {
            it("Mint license tokens with non-commerical social remixing PIL for an IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId1, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
            });

            it("Mint license tokens with commercial use PIL for an IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId2, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
            });

            it("Mint license tokens with commericial remix PIL for an IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, licenseTermsId3, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenId).to.be.a("string").and.not.empty;
                licenseTokenId3 = response.licenseTokenId;
            });
        });

        describe("Register Derivative IP Asset with License Tokens and Royalty Related Process", async function () {
            let snapshotId1: string;
            const payAmount: string = "100";
            const revenueTokens: string = String(Number(payAmount) + Number(mintingFee1) * 2 + Number(mintingFee2) * 2);

            before("Register IP Asset", async function () {
                const tokenIdB = await mintNFTWithRetry(privateKeyB);
                checkMintResult(tokenIdB);

                const response = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;

                ipIdB = response.ipId;                
            })

            step("Register derivative with license tokens attached commercial remix PIL, parent IP is an IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenId3], waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Pay royalty on behalf", async function () {
                const response = await expect(
                    payRoyaltyOnBehalf("B", ipIdA, ipIdB, mintingFeeTokenAddress, payAmount, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("A", ipIdA, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a("string").and.be.equal(String(commercialRevShare));
            });

            step("Captue snapshot", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;

                expect(response).to.be.a("string").and.be.equal(revenueTokens);
            });

            step("Claim royalty tokens", async function () {
                const response = await expect(
                    royaltyClaimRevenue("A", [snapshotId1], ipIdA, ipIdA, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.a("string").and.be.equal(revenueTokens);
            });
        });

        describe("Register Derivative IP Asset without License Tokens", async function () {
            describe("Non-commerical social remixing PIL", async function () {
                before("Register IP Asset", async function () {
                    const tokenIdB = await mintNFTWithRetry(privateKeyB);
                    checkMintResult(tokenIdB);
    
                    const response = await expect(
                        registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                    ).to.not.be.rejected;
    
                    expect(response.txHash).to.be.a("string").and.not.empty;
                    expect(response.ipId).to.be.a("string").and.not.empty;
    
                    ipIdB = response.ipId;                
                })
    
                step("Register derivative with non-commercial social remixing PIL, parent IP is an IN_DISPUTE IP asset", async function () {
                    const response = await expect(
                        registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId1], waitForTransaction)
                    ).to.not.be.rejected;
    
                    expect(response.txHash).to.be.a("string").and.not.empty;
                });                 
            });

            describe("Commercial use PIL", async function () {
                before("Register IP Asset", async function () {
                    const tokenIdB = await mintNFTWithRetry(privateKeyB);
                    checkMintResult(tokenIdB);
    
                    const response = await expect(
                        registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                    ).to.not.be.rejected;
    
                    expect(response.txHash).to.be.a("string").and.not.empty;
                    expect(response.ipId).to.be.a("string").and.not.empty;
    
                    ipIdB = response.ipId;                
                })
    
                step("Register derivative with commercial use PIL, parent IP is an IN_DISPUTE IP asset", async function () {
                    const response = await expect(
                        registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId2], waitForTransaction)
                    ).to.not.be.rejected;
    
                    expect(response.txHash).to.be.a("string").and.not.empty;
                });                 
            });           

            describe("Commercial remix PIL", async function () {
                before("Register IP Asset", async function () {
                    const tokenIdB = await mintNFTWithRetry(privateKeyB);
                    checkMintResult(tokenIdB);
    
                    const response = await expect(
                        registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                    ).to.not.be.rejected;
    
                    expect(response.txHash).to.be.a("string").and.not.empty;
                    expect(response.ipId).to.be.a("string").and.not.empty;
    
                    ipIdB = response.ipId;                
                })
    
                step("Register derivative with commercial remix PIL, parent IP is an IN_DISPUTE IP asset", async function () {
                    const response = await expect(
                        registerDerivative("B", ipIdB, [ipIdA], [licenseTermsId3], waitForTransaction)
                    ).to.not.be.rejected;
    
                    expect(response.txHash).to.be.a("string").and.not.empty;
                });                 
            });           
        });
    });
});