import { privateKeyA, privateKeyB, privateKeyC, mintingFeeTokenAddress, accountC, clientC, accountB, chainId, clientA, accountA } from '../../config/config'
import { getTotalRTSupply} from '../../utils/utils'
import { getRoyaltyVaultAddress, payRoyaltyOnBehalf, registerCommercialRemixPIL } from '../../utils/sdkUtils'
import { mintNFTCreateRootIPandAttachPIL, mintNFTAndRegisterDerivative, checkRoyaltyTokensCollected, getSnapshotId,checkClaimableRevenue, claimRevenueByIPA, claimRevenueByEOA, transferTokenToEOA, transferTokenToEOAWithSig } from '../testUtils'

import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import { Address, Hex } from 'viem';
import '../setup';
import { AccessPermission, getPermissionSignature } from '@story-protocol/core-sdk'
import { coreMetadataModuleAbi } from '@story-protocol/core-sdk/dist/declarations/src/abi/generated'

let ipIdA: Address;
let ipIdB: Address;
let ipIdC: Address;
let ipIdD: Address;
let snapshotId1_ipIdA: bigint;
let snapshotId1_ipIdB: bigint;
let snapshotId1_ipIdC: bigint;
let snapshotId1_ipIdD: bigint;
let TOTAL_RT_SUPPLY: number;

describe("SDK E2E Test - Royalty", function () {
    this.beforeAll("Get total RT supply", async function (){
        TOTAL_RT_SUPPLY = await getTotalRTSupply();
        console.log("TOTAL_RT_SUPPLY: " + TOTAL_RT_SUPPLY);
    });

    describe("Commercial Remix PIL - Claim Minting Fee by IPA account", function () {
        const mintingFee: string = "100";
        const commercialRevShare: number = 0.5;
        before("Register parent and derivative IP Assets", async function () {    
            // Register commercial use PIL
            const licenseTermsId = Number((await registerCommercialRemixPIL("A", mintingFee, commercialRevShare, mintingFeeTokenAddress, true)).licenseTermsId);

            // root IP: ipIdA
            ipIdA = await mintNFTCreateRootIPandAttachPIL("A", privateKeyA, licenseTermsId);
            // ipIdB is ipIdA's derivative IP
            ipIdB = await mintNFTAndRegisterDerivative("B", privateKeyB, [ipIdA], [licenseTermsId]);
        });

        step("ipIdA collect royalty tokens from ipIdB", async function () {
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdB, BigInt(TOTAL_RT_SUPPLY * (commercialRevShare/100)));
        });

        step("Capture snapshotId for ipIdB", async function () {
            snapshotId1_ipIdB = await getSnapshotId("B", ipIdB);
        });

        step("ipIdA check claimable revenue from vaultIpIdB", async function () {
            await checkClaimableRevenue("A", ipIdB, ipIdA, snapshotId1_ipIdB, 0n);
        });

        step("ipIdA claim revenue from vaultIpIdB", async function () {
            await claimRevenueByIPA("A", [snapshotId1_ipIdB], ipIdB, ipIdA, 0n);              
        });

        step("ipIdB check claimable revenue from vaultIpIdB", async function () {
            await checkClaimableRevenue("B", ipIdB, ipIdB, snapshotId1_ipIdB, 0n);
        });

        step("ipIdB claim revenue from vaultIpIdB", async function () {
            await claimRevenueByIPA("B", [snapshotId1_ipIdB], ipIdB, ipIdB, 0n);              
        });

        step("Capture snapshotId for ipIdA", async function () {
            snapshotId1_ipIdA = await getSnapshotId("A", ipIdA);
        });

        step("ipIdA check claimable revenue from vaultIpIdA", async function () {
            await checkClaimableRevenue("A", ipIdA, ipIdA, snapshotId1_ipIdA, BigInt(mintingFee));
        });

        step("idIdA claim revenue from vaultIpIdA (minting fee)", async function () {
            await claimRevenueByIPA("A", [snapshotId1_ipIdA], ipIdA, ipIdA, BigInt(mintingFee));
        });

        step("Check claimable revenue again", async function () {
            await checkClaimableRevenue("A", ipIdA, ipIdA, snapshotId1_ipIdA, 0n);
        }); 
    });

    describe('Commercial Remix PIL - Claim Minting Fee and Revenue by IPA account', async function () {
        const mintingFee = "600";
        const payAmount = 100;
        const commercialRevShare = 10;
        before("Register parent and derivative IP Assets", async function () {
            // create license terms
            const licenseTermsId = Number((await registerCommercialRemixPIL("A", mintingFee, commercialRevShare, mintingFeeTokenAddress, true)).licenseTermsId);
            
            // root IP: ipIdA
            ipIdA = await mintNFTCreateRootIPandAttachPIL("A", privateKeyA, licenseTermsId);
            // ipIdB is ipIdA's derivative IP
            ipIdB = await mintNFTAndRegisterDerivative("B", privateKeyB, [ipIdA], [licenseTermsId]);
            // ipIdC is ipIdB's derivative IP
            ipIdC = await mintNFTAndRegisterDerivative("C", privateKeyC, [ipIdB], [licenseTermsId]); 
            // ipIdD is ipIdC's derivative IP
            ipIdD = await mintNFTAndRegisterDerivative("C", privateKeyC, [ipIdC], [licenseTermsId]);               
        });

        step("ipIdA collect royalty tokens from ipIdB's vault account", async function () {
            const expectedRoyaltyTokensCollected = BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY);
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdB, expectedRoyaltyTokensCollected);
        });

        step("ipIdA collect royalty tokens from ipIdC's vault account", async function () {
            const expectedRoyaltyTokensCollected = BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY);
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdC, expectedRoyaltyTokensCollected);
        });

        step("ipIdA collect royalty tokens from ipIdD's vault account", async function () {
            const expectedRoyaltyTokensCollected = BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY);
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdD, expectedRoyaltyTokensCollected);
        });

        step("ipIdB collect royalty tokens from ipIdC's vault account", async function () {
            const expectedRoyaltyTokensCollected = BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY);
            await checkRoyaltyTokensCollected("B", ipIdB, ipIdC, expectedRoyaltyTokensCollected);
        });

        step("ipIdB collect royalty tokens from ipIdD's vault account", async function () {
            const expectedRoyaltyTokensCollected = BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY);
            await checkRoyaltyTokensCollected("B", ipIdB, ipIdD, expectedRoyaltyTokensCollected);
        });

        step("ipIdC collect royalty tokens from ipIdD's vault account", async function () {
            const expectedRoyaltyTokensCollected = BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY);
            await checkRoyaltyTokensCollected("C", ipIdC, ipIdD, expectedRoyaltyTokensCollected);
        });
               
        step("ipIdD pay royalty on behalf to ipIdC", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("C", ipIdC, ipIdD, mintingFeeTokenAddress, payAmount, true)
            ).to.not.be.rejected;
            
            expect(response.txHash).to.be.a("string").and.not.empty;
        }); 

        step("Capture snapshotId for ipIdD", async function () {
            snapshotId1_ipIdD = await getSnapshotId("C", ipIdD);
        });

        step("Capture snapshotId for ipIdC", async function () {
            snapshotId1_ipIdC = await getSnapshotId("C", ipIdC);
        });

        step("Capture snapshotId for ipIdB", async function () {
            snapshotId1_ipIdB = await getSnapshotId("B", ipIdB);
        });

        step("Capture snapshotId for ipIdA", async function () {
            snapshotId1_ipIdA = await getSnapshotId("A", ipIdA);
        });

        step("Check claimable revenue A from D", async function () {
            await checkClaimableRevenue("A", ipIdD, ipIdA, snapshotId1_ipIdD, 0n);
        });

        step("Check claimable revenue B from D", async function () {
            await checkClaimableRevenue("B", ipIdD, ipIdB, snapshotId1_ipIdD, 0n);
        });

        step("Check claimable revenue C from D", async function () {
            await checkClaimableRevenue("C", ipIdD, ipIdC, snapshotId1_ipIdD, 0n);
        });

        step("Check claimable revenue D from D", async function () {
            await checkClaimableRevenue("C", ipIdD, ipIdD, snapshotId1_ipIdD, 0n);
        });

        step("Check claimable revenue A from C", async function () {
            const expectedClaimableRevenue = BigInt((Number(mintingFee) + payAmount) * commercialRevShare / 100);
            await checkClaimableRevenue("A", ipIdC, ipIdA, snapshotId1_ipIdC, expectedClaimableRevenue);
        });

        step("Check claimable revenue B from C", async function () {
            const expectedClaimableRevenue = BigInt((Number(mintingFee) + payAmount) * commercialRevShare / 100);
            await checkClaimableRevenue("B", ipIdC, ipIdB, snapshotId1_ipIdC, expectedClaimableRevenue);
        });

        step("Check claimable revenue C from C", async function () {
            const expectedClaimableRevenue = BigInt((Number(mintingFee) + payAmount) * ((100 - 2 * commercialRevShare) / 100));
            await checkClaimableRevenue("C", ipIdC, ipIdC, snapshotId1_ipIdC, expectedClaimableRevenue);
        });

        step("Check claimable revenue A from B", async function () {
            const expectedClaimableRevenue = BigInt((Number(mintingFee)) * commercialRevShare / 100);
            await checkClaimableRevenue("A", ipIdB, ipIdA, snapshotId1_ipIdB, expectedClaimableRevenue);
        });

        step("Check claimable revenue B from B", async function () {
            const expectedClaimableRevenue = BigInt((Number(mintingFee)) * ((100 - commercialRevShare) / 100));
            await checkClaimableRevenue("B", ipIdB, ipIdB, snapshotId1_ipIdB, expectedClaimableRevenue);
        }); 

        step("Check claimable revenue A from A", async function () {
            const expectedClaimableRevenue = BigInt(mintingFee);
            await checkClaimableRevenue("A", ipIdA, ipIdA, snapshotId1_ipIdA, expectedClaimableRevenue);
        }); 

        step("Claim revenue A from D", async function () {
            await claimRevenueByIPA("A", [snapshotId1_ipIdD], ipIdD, ipIdA, 0n);            
        });        

        step("Claim revenue B from D", async function () {
            await claimRevenueByIPA("B", [snapshotId1_ipIdD], ipIdD, ipIdB, 0n);            
        });

        step("Claim revenue C from D", async function () {
            await claimRevenueByIPA("C", [snapshotId1_ipIdD], ipIdD, ipIdC, 0n);            
        });

        step("Claim revenue D from D", async function () {
            await claimRevenueByIPA("C", [snapshotId1_ipIdD], ipIdD, ipIdD, 0n);            
        });

        step("Claim revenue A from C", async function () {
            const expectedClaimableToken = BigInt((Number(mintingFee) + payAmount) * commercialRevShare / 100);
            await claimRevenueByIPA("A", [snapshotId1_ipIdC], ipIdC, ipIdA, expectedClaimableToken);            
        });        

        step("Claim revenue B from C", async function () {
            const expectedClaimableToken = BigInt((Number(mintingFee) + payAmount) * commercialRevShare / 100);
            await claimRevenueByIPA("B", [snapshotId1_ipIdC], ipIdC, ipIdB, expectedClaimableToken);            
        });

        step("Claim revenue C from C", async function () {
            const expectedClaimableToken = BigInt((Number(mintingFee) + payAmount) * ((100 - commercialRevShare - commercialRevShare) / 100));
            await claimRevenueByIPA("C", [snapshotId1_ipIdC], ipIdC, ipIdC, expectedClaimableToken);            
        });
                
        step("Claim revenue A from B", async function () {
            const expectedClaimableToken = BigInt((Number(mintingFee)) * commercialRevShare / 100);
            await claimRevenueByIPA("A", [snapshotId1_ipIdB], ipIdB, ipIdA, expectedClaimableToken);            
        });        

        step("Claim revenue B from B", async function () {
            const expectedClaimableToken = BigInt((Number(mintingFee)) * ((100 - commercialRevShare) / 100));
            await claimRevenueByIPA("B", [snapshotId1_ipIdB], ipIdB, ipIdB, expectedClaimableToken);            
        });

        step("Claim revenue A from A", async function () {
            const expectedClaimableToken = BigInt(mintingFee);
            await claimRevenueByIPA("A", [snapshotId1_ipIdA], ipIdA, ipIdA, expectedClaimableToken);            
        });
    });
            
    describe("Commercial Remix PIL - Claim Minting Fee and Revenue by EOA", function () {
        const mintingFee = "1000";
        const payAmount = 6000;
        const commercialRevShare = 20;
        before("Register parent and derivative IP Assets", async function () {
            // create license terms
            const licenseTermsId = Number((await registerCommercialRemixPIL("A", mintingFee, commercialRevShare, mintingFeeTokenAddress, true)).licenseTermsId);
            
            // root IP: ipIdA
            ipIdA = await mintNFTCreateRootIPandAttachPIL("A", privateKeyA, licenseTermsId);
            // ipIdB is ipIdA's derivative IP
            ipIdB = await mintNFTAndRegisterDerivative("B", privateKeyB, [ipIdA], [licenseTermsId]);
            // ipIdC is ipIdB's derivative IP
            ipIdC = await mintNFTAndRegisterDerivative("C", privateKeyC, [ipIdB], [licenseTermsId]); 
            // ipIdD is ipIdC's derivative IP
            ipIdD = await mintNFTAndRegisterDerivative("C", privateKeyC, [ipIdC], [licenseTermsId]);               
        });

        step("ipIdA collect royalty tokens from ipIdB's vault account", async function () {
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdB, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdA collect royalty tokens from ipIdC's vault account", async function () {
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdC, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdA collect royalty tokens from ipIdD's vault account", async function () {
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdD, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdB collect royalty tokens from ipIdC's vault account", async function () {
            await checkRoyaltyTokensCollected("B", ipIdB, ipIdC, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdB collect royalty tokens from ipIdD's vault account", async function () {
            await checkRoyaltyTokensCollected("B", ipIdB, ipIdD, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdC collect royalty tokens from ipIdD's vault account", async function () {
            await checkRoyaltyTokensCollected("C", ipIdC, ipIdD, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("Transfer token to EOA - ipIdC", async function () {
            await transferTokenToEOA("C", ipIdC, accountC.address, BigInt(60 * 10 ** 6));
        });
               
        step("ipIdD pay royalty on behalf to ipIdC", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("C", ipIdC, ipIdD, mintingFeeTokenAddress, payAmount, true)
            ).to.not.be.rejected;
            
            expect(response.txHash).to.be.a("string").and.not.empty;
        }); 

        step("Capture snapshotId for ipIdC", async function () {
            snapshotId1_ipIdC = await getSnapshotId("C", ipIdC);
        });

        step("Check claimable revenue A from C", async function () {
            const expectedClaimableRevenue = BigInt((Number(mintingFee) + payAmount) * commercialRevShare / 100);
            await checkClaimableRevenue("A", ipIdC, ipIdA, snapshotId1_ipIdC, expectedClaimableRevenue);
        });

        step("Check claimable revenue B from C", async function () {
            const expectedClaimableRevenue = BigInt((Number(mintingFee) + payAmount) * commercialRevShare / 100);
            await checkClaimableRevenue("B", ipIdC, ipIdB, snapshotId1_ipIdC, expectedClaimableRevenue);
        });

        step("Check claimable revenue C from C", async function () {
            await checkClaimableRevenue("C", ipIdC, ipIdC, snapshotId1_ipIdC, 0n);
        });

        step("Claim revenue by EOA A from C", async function () {
            await claimRevenueByEOA("A", [snapshotId1_ipIdC], ipIdC, 0n);            
        });        

        step("Claim revenue by EOA B from C", async function () {
            await claimRevenueByEOA("B", [snapshotId1_ipIdC], ipIdC, 0n);            
        });

        step("Claim revenue by EOA C from C", async function () {
            const expectedClaimableToken = BigInt((Number(mintingFee) + payAmount) * ((100 - 2 * commercialRevShare) / 100));
            await claimRevenueByEOA("C", [snapshotId1_ipIdC], ipIdC, expectedClaimableToken);            
        });        
    });
            
    describe("Commercial Remix PIL - Claim Minting Fee and Revenue by EOA1", function () {
        const mintingFee = 600;
        const payAmount = 2000;
        const commercialRevShare = 10;
        before("Register parent and derivative IP Assets", async function () {
            // create license terms
            const licenseTermsId = Number((await registerCommercialRemixPIL("A", mintingFee, commercialRevShare, mintingFeeTokenAddress, true)).licenseTermsId);
            
            // root IP: ipIdA
            ipIdA = await mintNFTCreateRootIPandAttachPIL("A", privateKeyA, licenseTermsId);
            // ipIdB is ipIdA's derivative IP
            ipIdB = await mintNFTAndRegisterDerivative("B", privateKeyB, [ipIdA], [licenseTermsId]);
            // ipIdC is ipIdB's derivative IP
            ipIdC = await mintNFTAndRegisterDerivative("C", privateKeyC, [ipIdB], [licenseTermsId]); 
            // ipIdD is ipIdC's derivative IP
            ipIdD = await mintNFTAndRegisterDerivative("C", privateKeyC, [ipIdC], [licenseTermsId]);               
        });

        step("ipIdA collect royalty tokens from ipIdB's vault account", async function () {
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdB, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdA collect royalty tokens from ipIdC's vault account", async function () {
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdC, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdA collect royalty tokens from ipIdD's vault account", async function () {
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdD, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdB collect royalty tokens from ipIdC's vault account", async function () {
            await checkRoyaltyTokensCollected("B", ipIdB, ipIdC, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdB collect royalty tokens from ipIdD's vault account", async function () {
            await checkRoyaltyTokensCollected("B", ipIdB, ipIdD, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdC collect royalty tokens from ipIdD's vault account", async function () {
            await checkRoyaltyTokensCollected("C", ipIdC, ipIdD, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("Transfer token to EOA - ipIdC to ipIdA", async function () {
            console.log((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 4)
            await transferTokenToEOA("C", ipIdC, accountA.address, BigInt((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 4));
        });

        step("Transfer token to EOA - ipIdC to ipIdB", async function () {
            console.log((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 4)
            await transferTokenToEOA("C", ipIdC, accountB.address, BigInt((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 4));
        });

        step("Transfer token to EOA - ipIdC to ipIdC", async function () {
            console.log((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 2)
            await transferTokenToEOA("C", ipIdC, accountC.address, BigInt((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 4));
        });
               
        step("ipIdD pay royalty on behalf to ipIdC", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("C", ipIdC, ipIdD, mintingFeeTokenAddress, payAmount, true)
            ).to.not.be.rejected;
            
            expect(response.txHash).to.be.a("string").and.not.empty;
        }); 

        step("Capture snapshotId for ipIdC", async function () {
            snapshotId1_ipIdC = await getSnapshotId("C", ipIdC);
        });

        step("Check claimable revenue A from C", async function () {
            const expectedClaimableRevenue = BigInt((mintingFee + payAmount) * commercialRevShare / 100);
            await checkClaimableRevenue("A", ipIdC, ipIdA, snapshotId1_ipIdC, expectedClaimableRevenue);
        });

        step("Check claimable revenue B from C", async function () {
            const expectedClaimableRevenue = BigInt((mintingFee + payAmount) * commercialRevShare / 100);
            await checkClaimableRevenue("B", ipIdC, ipIdB, snapshotId1_ipIdC, expectedClaimableRevenue);
        });

        step("Check claimable revenue C from C", async function () {
            const expectedClaimableRevenue = BigInt((mintingFee + payAmount) * (100 - 2 * commercialRevShare)/100 /4);
            await checkClaimableRevenue("C", ipIdC, ipIdC, snapshotId1_ipIdC, expectedClaimableRevenue);
        });

        step("Claim revenue by EOA A from C", async function () {
            const expectedClaimableToken = BigInt((mintingFee + payAmount) * ((100 - 2 * commercialRevShare) / 100) / 4);
            await claimRevenueByEOA("A", [snapshotId1_ipIdC], ipIdC, expectedClaimableToken);            
        });        

        step("Claim revenue by EOA B from C", async function () {
            const expectedClaimableToken = BigInt((mintingFee + payAmount) * ((100 - 2 * commercialRevShare) / 100) / 4);
            await claimRevenueByEOA("B", [snapshotId1_ipIdC], ipIdC, expectedClaimableToken);            
        });

        step("Claim revenue by EOA C from C", async function () {
            const expectedClaimableToken = BigInt((mintingFee + payAmount) * ((100 - 2 * commercialRevShare) / 100) / 4);
            await claimRevenueByEOA("C", [snapshotId1_ipIdC], ipIdC, expectedClaimableToken);            
        });
    });
            
    describe("Commercial Remix PIL - Claim Minting Fee and Revenue by EOA2", function () {
        const mintingFee = 600;
        const payAmount = 2000;
        const commercialRevShare = 10;
        before("Register parent and derivative IP Assets", async function () {
            // create license terms
            const licenseTermsId = Number((await registerCommercialRemixPIL("A", mintingFee, commercialRevShare, mintingFeeTokenAddress, true)).licenseTermsId);
            
            // root IP: ipIdA
            ipIdA = await mintNFTCreateRootIPandAttachPIL("A", privateKeyA, licenseTermsId);
            // ipIdB is ipIdA's derivative IP
            ipIdB = await mintNFTAndRegisterDerivative("B", privateKeyB, [ipIdA], [licenseTermsId]);
            // ipIdC is ipIdB's derivative IP
            ipIdC = await mintNFTAndRegisterDerivative("C", privateKeyC, [ipIdB], [licenseTermsId]); 
            // ipIdD is ipIdC's derivative IP
            ipIdD = await mintNFTAndRegisterDerivative("C", privateKeyC, [ipIdC], [licenseTermsId]);               
        });

        step("Transfer token to EOA - ipIdC to ipIdA", async function () {
            console.log((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 4)
            await transferTokenToEOA("C", ipIdC, accountA.address, BigInt((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 4));
        });

        step("Transfer token to EOA - ipIdC to ipIdB", async function () {
            console.log((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 4)
            await transferTokenToEOA("C", ipIdC, accountB.address, BigInt((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 4));
        });

        step("Transfer token to EOA - ipIdC to ipIdC", async function () {
            console.log((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 2)
            await transferTokenToEOA("C", ipIdC, accountC.address, BigInt((100 - 2 * commercialRevShare)/100 * TOTAL_RT_SUPPLY / 4));
        });
               
        step("ipIdD pay royalty on behalf to ipIdC", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("C", ipIdC, ipIdD, mintingFeeTokenAddress, payAmount, true)
            ).to.not.be.rejected;
            
            expect(response.txHash).to.be.a("string").and.not.empty;
        }); 

        step("ipIdA collect royalty tokens from ipIdB's vault account", async function () {
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdB, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdA collect royalty tokens from ipIdC's vault account", async function () {
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdC, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdA collect royalty tokens from ipIdD's vault account", async function () {
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdD, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdB collect royalty tokens from ipIdC's vault account", async function () {
            await checkRoyaltyTokensCollected("B", ipIdB, ipIdC, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdB collect royalty tokens from ipIdD's vault account", async function () {
            await checkRoyaltyTokensCollected("B", ipIdB, ipIdD, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });

        step("ipIdC collect royalty tokens from ipIdD's vault account", async function () {
            await checkRoyaltyTokensCollected("C", ipIdC, ipIdD, BigInt(commercialRevShare/100 * TOTAL_RT_SUPPLY));
        });        

        step("Capture snapshotId for ipIdC", async function () {
            snapshotId1_ipIdC = await getSnapshotId("C", ipIdC);
        });

        step("Check claimable revenue A from C", async function () {
            const expectedClaimableRevenue = BigInt((mintingFee + payAmount) * commercialRevShare / 100);
            await checkClaimableRevenue("A", ipIdC, ipIdA, snapshotId1_ipIdC, expectedClaimableRevenue);
        });

        step("Check claimable revenue B from C", async function () {
            const expectedClaimableRevenue = BigInt((mintingFee + payAmount) * commercialRevShare / 100);
            await checkClaimableRevenue("B", ipIdC, ipIdB, snapshotId1_ipIdC, expectedClaimableRevenue);
        });

        step("Check claimable revenue C from C", async function () {
            const expectedClaimableRevenue = BigInt((mintingFee + payAmount) * (100 - 2 * commercialRevShare)/100 /4);
            await checkClaimableRevenue("C", ipIdC, ipIdC, snapshotId1_ipIdC, expectedClaimableRevenue);
        });

        step("Claim revenue by EOA A from C", async function () {
            const expectedClaimableToken = BigInt((mintingFee + payAmount) * ((100 - 2 * commercialRevShare) / 100) / 4);
            await claimRevenueByEOA("A", [snapshotId1_ipIdC], ipIdC, expectedClaimableToken);            
        });        

        step("Claim revenue by EOA B from C", async function () {
            const expectedClaimableToken = BigInt((mintingFee + payAmount) * ((100 - 2 * commercialRevShare) / 100) / 4);
            await claimRevenueByEOA("B", [snapshotId1_ipIdC], ipIdC, expectedClaimableToken);            
        });

        step("Claim revenue by EOA C from C", async function () {
            const expectedClaimableToken = BigInt((mintingFee + payAmount) * ((100 - 2 * commercialRevShare) / 100) / 4);
            await claimRevenueByEOA("C", [snapshotId1_ipIdC], ipIdC, expectedClaimableToken);            
        });
    });
});
