import { privateKeyA, privateKeyB, accountB, nftContractAddress, arbitrationPolicyAddress, mintingFeeTokenAddress, privateKeyC, accountA } from '../../config/config';
import { mintNFTWithRetry, checkMintResult, setDisputeJudgement, sleep } from '../../utils/utils';
import { registerIpAsset, raiseDispute, attachLicenseTerms, mintLicenseTokens, registerDerivativeWithLicenseTokens, payRoyaltyOnBehalf, collectRoyaltyTokens, royaltySnapshot, royaltyClaimableRevenue, royaltyClaimRevenue, registerDerivative, resolveDispute } from '../../utils/sdkUtils';
import { Address } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { nonComLicenseTermsId, comUseLicenseTermsId1, comRemixLicenseTermsId2, mintingFee1, mintingFee2, commercialRevShare2 } from '../setup';

const waitForTransaction: boolean = true;

let ipIdA: Address;
let ipIdB: Address;
let ipIdC: Address;
let disputeId1: bigint;
let disputeId2: bigint;
let disputeId3: bigint;
let licenseTokenId1: bigint;
let licenseTokenId2: bigint;
let licenseTokenId3: bigint;

describe("SDK E2E Test - Dispute Module", function () {
    describe("IP Asset is IN_DISPUTE", async function () {
        before("Register IP assets and raise dispute", async function () {
            const tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);

            const responseRegisterIpAsset = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpAsset.ipId;

            const tokenIdB = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdB);

            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdB = response.ipId;

            const responseRaiseDispute = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRaiseDispute.txHash).to.be.a("string").and.not.empty;
            expect(responseRaiseDispute.disputeId).to.be.a("bigint").and.to.be.ok;
        });

        describe("Attach License Terms to IN_DISPUTE IP Asset", async function () {
            it("Attach non-commerical social remixing PIL to IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, nonComLicenseTermsId, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
            });
    
            it("Attach commercial use PIL to IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
            });
    
            it("Attach commercial remix PIL to IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, comRemixLicenseTermsId2, waitForTransaction)
                ).to.not.be.rejected;
    
                expect(response.txHash).to.be.a("string").and.not.empty;
            });            
        });

        describe("Mint License Tokens for IN_DISPUTE IP asset", async function () {
            it("Mint license tokens with non-commerical social remixing PIL for IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, nonComLicenseTermsId, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);
            });

            it("Mint license tokens with commercial use PIL for IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, comUseLicenseTermsId1, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);
            });

            it("Mint license tokens with commercial remix PIL for IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    mintLicenseTokens("A", ipIdA, comRemixLicenseTermsId2, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);

                licenseTokenId3 = response.licenseTokenIds[0];
            });
        });

        describe("Register Derivative IP Asset with License Tokens and Royalty Related Process", async function () {
            let snapshotId1: string;
            const payAmount: string = "100";
            const revenueTokens: bigint = BigInt(Number(payAmount) + Number(mintingFee1) * 2 + Number(mintingFee2) * 2);

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
                expect(response.royaltyTokensCollected).to.be.a("bigint").and.be.equal(BigInt(commercialRevShare2 * 1000000));
            });

            step("Capture snapshot", async function () {
                const response = await expect(
                    royaltySnapshot("A", ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("String").and.not.empty;

                snapshotId1 = response.snapshotId;
            });

            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("A", ipIdA, ipIdA, snapshotId1, mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;

                expect(response).to.be.a("bigint").and.be.equal(revenueTokens);
            });

            step("Claim royalty tokens", async function () {
                const response = await expect(
                    royaltyClaimRevenue("A", [snapshotId1], ipIdA, mintingFeeTokenAddress, ipIdA, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.a("bigint").and.be.equal(revenueTokens);
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
                        registerDerivative("B", ipIdB, [ipIdA], [comRemixLicenseTermsId2], waitForTransaction)
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
                        registerDerivative("B", ipIdB, [ipIdA], [comUseLicenseTermsId1], waitForTransaction)
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
                });                
                
                step("Register derivative with commercial remix PIL, parent IP is an IN_DISPUTE IP asset", async function () {
                    const response = await expect(
                        registerDerivative("B", ipIdB, [ipIdA], [nonComLicenseTermsId], waitForTransaction)
                    ).to.not.be.rejected;
    
                    expect(response.txHash).to.be.a("string").and.not.empty;
                });                 
            });           
        });
    });

    describe("IP Asset is DISPUTED", async function () {
        before("Register IP assets and raise dispute", async function () {
            const tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);
    
            const responseRegisterIpAsset = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;
    
            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;
    
            ipIdA = responseRegisterIpAsset.ipId;
    
            const tokenIdB = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdB);
    
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;
    
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;
    
            ipIdB = response.ipId;
    
            const responseRaiseDispute = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
            ).to.not.be.rejected;
    
            expect(responseRaiseDispute.txHash).to.be.a("string").and.not.empty;
            expect(responseRaiseDispute.disputeId).to.be.a("bigint").and.to.be.ok;
    
            disputeId1 = responseRaiseDispute.disputeId;

            await setDisputeJudgement(privateKeyC, disputeId1, true, "0x");
        });

        describe("Attach License Terms to DISPUTED IP Asset", async function () {
            it("Attach non-commerical social remixing PIL to a DISPUTED IP asset", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, nonComLicenseTermsId, waitForTransaction)
                ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted.",
                                     "Error: LicensingModule__DisputedIpId()");
            });
    
            it("Attach commercial use PIL to an IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
                ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted.",
                                     "Error: LicensingModule__DisputedIpId()");
            });
    
            it("Attach commericial remix PIL to an IN_DISPUTE IP asset", async function () {
                const response = await expect(
                    attachLicenseTerms("A", ipIdA, comRemixLicenseTermsId2, waitForTransaction)
                ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted.",
                                     "Error: LicensingModule__DisputedIpId()");
            });            
        });

        describe("Mint License Tokens for DISPUTED IP asset", async function () {
            before("Attach license terms, raise dispute and set judgement", async function () {
                const response1 = await expect(
                    attachLicenseTerms("B", ipIdB, nonComLicenseTermsId, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response1.txHash).to.be.a("string").and.not.empty;

                const response2 = await expect(
                    attachLicenseTerms("B", ipIdB, comUseLicenseTermsId1, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response2.txHash).to.be.a("string").and.not.empty;

                const response3 = await expect(
                    attachLicenseTerms("B", ipIdB, comRemixLicenseTermsId2, waitForTransaction)
                ).to.not.be.rejected;
                
                expect(response3.txHash).to.be.a("string").and.not.empty;

                const responseRaiseDispute = await expect(
                    raiseDispute("A", ipIdB, arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
                ).to.not.be.rejected;

                expect(responseRaiseDispute.txHash).to.be.a("string").and.not.empty;
                expect(responseRaiseDispute.disputeId).to.be.a("bigint").and.to.be.ok;
                
                disputeId2 = responseRaiseDispute.disputeId;

                await setDisputeJudgement(privateKeyC, disputeId2, true, "0x");
            });

            it("Mint license tokens with non-commerical social remixing PIL for a DISPUTED IP asset", async function () {
                const response = await expect(
                    mintLicenseTokens("B", ipIdB, nonComLicenseTermsId, 2, accountB.address, waitForTransaction)
                ).to.be.rejectedWith("Failed to mint license tokens: The contract function \"mintLicenseTokens\" reverted.",
                                     "Error: LicensingModule__DisputedIpId()");
            });

            it("Mint license tokens with commerical use PIL for a DISPUTED IP asset", async function () {
                const response = await expect(
                    mintLicenseTokens("B", ipIdB, comUseLicenseTermsId1, 2, accountB.address, waitForTransaction)
                ).to.be.rejectedWith("Failed to mint license tokens: The contract function \"mintLicenseTokens\" reverted.",
                                     "Error: LicensingModule__DisputedIpId()");
            });

            it("Mint license tokens with commericial remix PIL for a DISPUTED IP asset", async function () {
                const response = await expect(
                    mintLicenseTokens("B", ipIdB, comRemixLicenseTermsId2, 2, accountB.address, waitForTransaction)
                ).to.be.rejectedWith("Failed to mint license tokens: The contract function \"mintLicenseTokens\" reverted.",
                                     "Error: LicensingModule__DisputedIpId()");
            });
        });

        describe("Register Derivative IP Asset without License Tokens", async function () {
            before("Register IP Asset", async function () {
                const tokenIdC = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdC);

                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdC, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;

                ipIdC = response.ipId;                
            });

            describe("Non-commerical social remixing PIL", async function () {    
                // 0x76a26b62: LicenseRegistry__ParentIpTagged(address)
                step("Register derivative with non-commercial social remixing PIL, parent IP is a DISPUTED IP asset", async function () {
                    const response = await expect(
                        registerDerivative("A", ipIdC, [ipIdB], [nonComLicenseTermsId], waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted with the following signature:", "0x76a26b62");
                });
    
                step("Register derivative with non-commercial social remixing PIL, derivative IP is a DISPUTED IP asset", async function () {
                    const responseAttachLicenseTerms = await expect(
                        attachLicenseTerms("A", ipIdC, nonComLicenseTermsId, waitForTransaction)
                    ).to.not.be.rejected;
                    
                    expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
                    
                    const response = await expect(
                        registerDerivative("B", ipIdB, [ipIdC], [nonComLicenseTermsId], waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", "Error: LicensingModule__DisputedIpId()");
                });
            });

            describe("Commercial use PIL", async function () {    
                // 0x76a26b62: LicenseRegistry__ParentIpTagged(address)
                step("Register derivative with commercial use PIL, parent IP is a DISPUTED IP asset", async function () {
                    const response = await expect(
                        registerDerivative("A", ipIdC, [ipIdB], [comUseLicenseTermsId1], waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted with the following signature:", "0x76a26b62");
                });

                step("Register derivative with non-commercial social remixing PIL, derivative IP is a DISPUTED IP asset", async function () {
                    const responseAttachLicenseTerms = await expect(
                        attachLicenseTerms("A", ipIdC, comUseLicenseTermsId1, waitForTransaction)
                    ).to.not.be.rejected;
                    
                    expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;
                    
                    const response = await expect(
                        registerDerivative("B", ipIdB, [ipIdC], [comUseLicenseTermsId1], waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", "Error: LicensingModule__DisputedIpId()");
                });
            });           

            describe("Commercial remix PIL", async function () {    
                // 0x76a26b62: LicenseRegistry__ParentIpTagged(address)
                step("Register derivative with commercial remix PIL, parent IP is a DISPUTED IP asset", async function () {
                    const response = await expect(
                        registerDerivative("A", ipIdC, [ipIdB], [comRemixLicenseTermsId2], waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted with the following signature:", "0x76a26b62");
                });
                                                                  
                step("Register derivative with non-commercial social remixing PIL, derivative IP is a DISPUTED IP asset", async function () {
                    const responseAttachLicenseTerms = await expect(
                        attachLicenseTerms("A", ipIdC, comRemixLicenseTermsId2, waitForTransaction)
                    ).to.not.be.rejected;
                    
                    expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;

                    const response = await expect(
                        registerDerivative("B", ipIdB, [ipIdC], [comRemixLicenseTermsId2], waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative: The contract function \"registerDerivative\" reverted.", "Error: LicensingModule__DisputedIpId()");
                });
            });           
        });

        describe("Register Derivative IP Asset with License Tokens", async function () {
            before("Register IP Asset", async function () {
                const responseResolveDispute = await expect(                                                           
                    resolveDispute("A", disputeId2, "0x0000", false)
                ).to.not.be.rejected;
    
                expect(responseResolveDispute.txHash).to.be.a("string").and.not.empty;

                await sleep(10);

                const responsemintLicenseTokens1 = await expect(
                    mintLicenseTokens("B", ipIdB, nonComLicenseTermsId, 2, accountA.address, true)    
                ).to.not.be.rejected;

                expect(responsemintLicenseTokens1.txHash).to.be.a("string").and.not.empty;
                expect(responsemintLicenseTokens1.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);

                licenseTokenId1 = responsemintLicenseTokens1.licenseTokenIds[0];

                const responsemintLicenseTokens2 = await expect(
                    mintLicenseTokens("B", ipIdB, comUseLicenseTermsId1, 2, accountA.address, true)      
                ).to.not.be.rejected;

                expect(responsemintLicenseTokens2.txHash).to.be.a("string").and.not.empty;
                expect(responsemintLicenseTokens2.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);

                licenseTokenId2 = responsemintLicenseTokens2.licenseTokenIds[0];

                const responsemintLicenseTokens3 = await expect(
                    mintLicenseTokens("B", ipIdB, comRemixLicenseTermsId2, 2, accountA.address, true)      
                ).to.not.be.rejected;

                expect(responsemintLicenseTokens3.txHash).to.be.a("string").and.not.empty;
                expect(responsemintLicenseTokens3.licenseTokenIds).to.be.a("array").and.to.have.lengthOf(2);

                licenseTokenId3 = responsemintLicenseTokens3.licenseTokenIds[0];

                const responseRaiseDispute = await expect(
                    raiseDispute("A", ipIdB, arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
                ).to.not.be.rejected;

                expect(responseRaiseDispute.txHash).to.be.a("string").and.not.empty;
                expect(responseRaiseDispute.disputeId).to.be.a("bigint").and.to.be.ok;
                
                disputeId2 = responseRaiseDispute.disputeId;

                await setDisputeJudgement(privateKeyC, disputeId2, true, "0x");

                const tokenIdC = await mintNFTWithRetry(privateKeyA);
                checkMintResult(tokenIdC);

                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdC, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;

                ipIdC = response.ipId;                
            });

            describe("Register derivative IP asset, parent IP is a DISPUTED IP asset, ", async function () {
                // 0x39944339: LicenseToken__RevokedLicense(uint256)
                step("Non-commerical social remixing PIL", async function () {
                    const response = await expect(
                        registerDerivativeWithLicenseTokens("A", ipIdC, [licenseTokenId1], waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted with the following signature:", "0x39944339");                
                });

                // 0x39944339: LicenseToken__RevokedLicense(uint256)
                step("Commercial use PIL", async function () {
                    const response = await expect(
                        registerDerivativeWithLicenseTokens("A", ipIdC, [licenseTokenId2],waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted with the following signature:", "0x39944339");
                });

                // 0x39944339: LicenseToken__RevokedLicense(uint256)
                step("Register derivative with commercial remix PIL, parent IP is a DISPUTED IP asset", async function () {
                    const response = await expect(
                        registerDerivativeWithLicenseTokens("A", ipIdC, [licenseTokenId3],waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted with the following signature:", "0x39944339");
                });
            });

            describe("Register derivative IP asset, derivative IP is a DISPUTED IP asset, ", async function () {                                                                  
                before("Resolve dispute for the parent IP, raise dispute for the derivative IP", async function () {
                    const responseResolveDispute = await expect(                                                           
                        resolveDispute("A", disputeId2, "0x0000", false)
                    ).to.not.be.rejected;
        
                    expect(responseResolveDispute.txHash).to.be.a("string").and.not.empty;
                    
                    const responseRaiseDispute = await expect(
                        raiseDispute("B", ipIdC, arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
                    ).to.not.be.rejected;

                    expect(responseRaiseDispute.txHash).to.be.a("string").and.not.empty;
                    expect(responseRaiseDispute.disputeId).to.be.a("bigint").and.to.be.ok;
                    
                    disputeId3 = responseRaiseDispute.disputeId;

                    await setDisputeJudgement(privateKeyC, disputeId3, true, "0x");                    
                })
                
                step("Non-commerical social remixing PIL", async function () {
                    const response = await expect(
                        registerDerivativeWithLicenseTokens("A", ipIdC, [licenseTokenId1], waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted.", "Error: LicensingModule__DisputedIpId()");
                });
                
                step("Commerical use PIL", async function () {
                    const response = await expect(
                        registerDerivativeWithLicenseTokens("A", ipIdC, [licenseTokenId2], waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted.", "Error: LicensingModule__DisputedIpId()");
                });
                
                step("Commerical remix PIL", async function () {
                    const response = await expect(
                        registerDerivativeWithLicenseTokens("A", ipIdC, [licenseTokenId3], waitForTransaction)
                    ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted.", "Error: LicensingModule__DisputedIpId()");
                });
            });    
        });

        describe("Register Derivative IP Asset with License Tokens and Royalty Related Process", async function () {
            let snapshotId1: bigint;
            const payAmount: string = "100";

            before("Resolve dispute for the derivative IP", async function () {
                const responseResolveDispute = await expect(                                                           
                    resolveDispute("B", disputeId3, "0x0000", false)
                ).to.not.be.rejected;
    
                expect(responseResolveDispute.txHash).to.be.a("string").and.not.empty;
                await sleep(10);               
            })

            step("Register derivative with license tokens attached commercial remix PIL", async function () {
                const response = await expect(
                    registerDerivativeWithLicenseTokens("A", ipIdC, [licenseTokenId3], waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Raise dispute for the parent IP and set dispute judgement", async function () {
                const responseRaiseDispute = await expect(
                    raiseDispute("A", ipIdB, arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
                ).to.not.be.rejected;

                expect(responseRaiseDispute.txHash).to.be.a("string").and.not.empty;
                expect(responseRaiseDispute.disputeId).to.be.a("bigint").and.to.be.ok;
                
                disputeId2 = responseRaiseDispute.disputeId;

                await setDisputeJudgement(privateKeyC, disputeId2, true, "0x");
            });

            step("Pay royalty on behalf, parent IP is DISPUTED", async function () {
                const response = await expect(
                    payRoyaltyOnBehalf("A", ipIdB, ipIdC, mintingFeeTokenAddress, payAmount, waitForTransaction)
                ).to.be.rejectedWith("Failed to pay royalty on behalf: The contract function \"payRoyaltyOnBehalf\" reverted.", "Error: RoyaltyModule__IpIsTagged()");
            });

            step("Pay royalty on behalf, derivative IP is DISPUTED", async function () {
                const responseResolveDispute = await expect(                                                           
                    resolveDispute("A", disputeId2, "0x0000", false)
                ).to.not.be.rejected;
    
                expect(responseResolveDispute.txHash).to.be.a("string").and.not.empty;

                const responseRaiseDispute = await expect(
                    raiseDispute("B", ipIdC, arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
                ).to.not.be.rejected;

                expect(responseRaiseDispute.txHash).to.be.a("string").and.not.empty;
                expect(responseRaiseDispute.disputeId).to.be.a("bigint").and.to.be.ok;
                
                disputeId3 = responseRaiseDispute.disputeId;

                await setDisputeJudgement(privateKeyC, disputeId3, true, "0x");

                const response = await expect(
                    payRoyaltyOnBehalf("B", ipIdB, ipIdC, mintingFeeTokenAddress, payAmount, waitForTransaction)
                ).to.be.rejectedWith("Failed to pay royalty on behalf: The contract function \"payRoyaltyOnBehalf\" reverted.", "Error: RoyaltyModule__IpIsTagged()");
            });

            step("Pay royalty on behalf", async function () {
                const responseResolveDispute = await expect(                                                           
                    resolveDispute("B", disputeId3, "0x0000", false)
                ).to.not.be.rejected;
    
                expect(responseResolveDispute.txHash).to.be.a("string").and.not.empty;
                await sleep(10);

                const response = await expect(
                    payRoyaltyOnBehalf("B", ipIdB, ipIdC, mintingFeeTokenAddress, payAmount, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
            });

            step("Raise dispute for the parent IP and set dispute judgement", async function () {
                const responseRaiseDispute = await expect(
                    raiseDispute("A", ipIdB, arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
                ).to.not.be.rejected;

                expect(responseRaiseDispute.txHash).to.be.a("string").and.not.empty;
                expect(responseRaiseDispute.disputeId).to.be.a("bigint").and.to.be.ok;
                
                disputeId2 = responseRaiseDispute.disputeId;

                await setDisputeJudgement(privateKeyC, disputeId2, true, "0x");
            });

            step("Collect royalty tokens", async function () {
                const response = await expect(
                    collectRoyaltyTokens("B", ipIdB, ipIdC, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.royaltyTokensCollected).to.be.a("bigint").and.be.equal(BigInt(commercialRevShare2 * 1000000));
            });

            step("Capture snapshot", async function () {
                const response = await expect(
                    royaltySnapshot("B", ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;

                snapshotId1 = response.snapshotId;
            });

            // IP asset is disputed, the cliaimable revenue should be 0
            step("Check claimable revenue", async function () {
                const response = await expect(
                    royaltyClaimableRevenue("B", ipIdB, ipIdB, BigInt(snapshotId1), mintingFeeTokenAddress, waitForTransaction)
                ).to.not.be.rejected;

                expect(response).to.be.a("bigint").and.be.equal(0n);
            });

            // IP asset is disputed, the cliaimable revenue should be 0
            step("Claim royalty tokens", async function () {
                const response = await expect(
                    royaltyClaimRevenue("B", [snapshotId1], ipIdB, mintingFeeTokenAddress, ipIdB, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.claimableToken).to.be.a("bigint").and.be.equal(0n);
            });
        });
    });
});


