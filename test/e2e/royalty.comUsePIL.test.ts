import { privateKeyA, privateKeyB, privateKeyC, mintingFeeTokenAddress, accountB, accountA } from '../../config/config'
import { getTotalRTSupply} from '../../utils/utils'
import { payRoyaltyOnBehalf, registerCommercialUsePIL } from '../../utils/sdkUtils'
import { expect } from 'chai'
import { mintNFTCreateRootIPandAttachPIL, mintNFTAndRegisterDerivative, checkRoyaltyTokensCollected, getSnapshotId,checkClaimableRevenue, claimRevenueByIPA, claimRevenueByEOA, transferTokenToEOA } from '../testUtils'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Address } from 'viem';
import { comUseLicenseTermsId1, mintingFee1 } from '../setup'

let ipIdA: Address;
let ipIdB: Address;
let ipIdC: Address;
let ipIdD: Address;
let snapshotId1_ipIdA: bigint;
let snapshotId1_ipIdB: bigint;
let TOTAL_RT_SUPPLY: number;

describe("SDK E2E Test - Royalty", function () {
    this.beforeAll("Get total RT supply", async function (){
        TOTAL_RT_SUPPLY = await getTotalRTSupply();
        console.log("TOTAL_RT_SUPPLY: " + TOTAL_RT_SUPPLY);
    });

    describe("Commercial Use PIL - Claim Minting Fee by IPA account", function () {
        before("Register parent and derivative IP assets", async function () {
            // root IP: ipIdA
            ipIdA = await mintNFTCreateRootIPandAttachPIL("A", privateKeyA, comUseLicenseTermsId1);
            // ipIdB is ipIdA's derivative IP
            ipIdB = await mintNFTAndRegisterDerivative("B", privateKeyB, [ipIdA], [comUseLicenseTermsId1]);
        });

        step("ipIdA collect royalty tokens from ipIdB", async function () {
            await checkRoyaltyTokensCollected("A", ipIdA, ipIdB, 0n);
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
            await checkClaimableRevenue("A", ipIdA, ipIdA, snapshotId1_ipIdA, BigInt(mintingFee1));
        });

        step("idIdA claim revenue from vaultIpIdA (minting fee)", async function () {
            await claimRevenueByIPA("A", [snapshotId1_ipIdA], ipIdA, ipIdA, BigInt(mintingFee1));
        });

        step("Check claimable revenue again", async function () {
            await checkClaimableRevenue("A", ipIdA, ipIdA, snapshotId1_ipIdA, 0n);
        });            
    });

    describe('Commercial Use PIL - Claim Minting Fee and Revenue by IPA account', async function () {
        const mintingFee: number = 180;
        const payAmount: number = 1000000;

        before("Register parent and derivative IP assets", async function () {    
            // register commercial use PIL
            const licenseTermsId = Number((await registerCommercialUsePIL("A", mintingFee, mintingFeeTokenAddress, true)).licenseTermsId);

            // root IP: ipIdA
            ipIdA = await mintNFTCreateRootIPandAttachPIL("A", privateKeyA, licenseTermsId);
            // ipIdB is ipIdA's derivative IP
            ipIdB = await mintNFTAndRegisterDerivative("B", privateKeyB, [ipIdA], [licenseTermsId]);
            // ipIdC is ipIdB's derivative IP
            ipIdC = await mintNFTAndRegisterDerivative("C", privateKeyC, [ipIdB], [licenseTermsId]);
        });

        step("ipIdC pay royalty on behalf to ipIdB", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("C", ipIdB, ipIdC, mintingFeeTokenAddress, payAmount, true)
            ).to.not.be.rejected;
            
            expect(response.txHash).to.be.a("string").and.not.empty;
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
            await checkClaimableRevenue("B", ipIdB, ipIdB, snapshotId1_ipIdB, BigInt(payAmount + mintingFee));
        });

        step("ipIdB claim revenue from vaultIpIdB", async function () {
            await claimRevenueByIPA("B", [snapshotId1_ipIdB], ipIdB, ipIdB, BigInt(payAmount + mintingFee));
        });

        step("Capture snapshotId for ipIdA", async function () {
            snapshotId1_ipIdA = await getSnapshotId("A", ipIdA);
        });

        step("ipIdA check claimable revenue from vaultIpIdA", async function () {
            await checkClaimableRevenue("A", ipIdA, ipIdA, snapshotId1_ipIdA, BigInt(mintingFee));
        });

        step("ipIdA claim revenue from vaultIpIdA", async function () {
            await claimRevenueByIPA("A", [snapshotId1_ipIdA], ipIdA, ipIdA, BigInt(mintingFee));
        });
    });

    describe('Commercial Use PIL - Claim Minting Fee and Revenue by EOA', async function () {
        const mintingFee: number = 200;
        const payAmount: number = 1000;

        before("Register parent and derivative IP assets", async function () {    
            // register commercial use PIL
            const licenseTermsId = Number((await registerCommercialUsePIL("A", mintingFee, mintingFeeTokenAddress, true)).licenseTermsId);

            // root IP: ipIdA
            ipIdA = await mintNFTCreateRootIPandAttachPIL("A", privateKeyA, licenseTermsId);
            // ipIdB is ipIdA's derivative IP
            ipIdB = await mintNFTAndRegisterDerivative("B", privateKeyB, [ipIdA], [licenseTermsId]);
            // ipIdC is ipIdB's derivative IP
            ipIdC = await mintNFTAndRegisterDerivative("C", privateKeyC, [ipIdB], [licenseTermsId]);
        });

        step("Transfer token to EOA - ipIdB", async function () {
            await transferTokenToEOA("B", ipIdB, accountB.address, BigInt(100 * 10 ** 6));
        });

        step("Transfer token to EOA - ipIdA", async function () {
            await transferTokenToEOA("A", ipIdA, accountA.address, BigInt(100 * 10 ** 6));
        });

        step("ipIdC pay royalty on behalf to ipIdB", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("C", ipIdB, ipIdC, mintingFeeTokenAddress, payAmount, true)
            ).to.not.be.rejected;
            
            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Capture snapshotId for ipIdB", async function () {
            snapshotId1_ipIdB = await getSnapshotId("B", ipIdB);
        });

        step("ipIdA check claimable revenue from vaultIpIdB", async function () {
            await checkClaimableRevenue("A", ipIdB, ipIdA, snapshotId1_ipIdB, 0n);
        });

        step("ipIdB check claimable revenue from vaultIpIdB", async function () {
            await checkClaimableRevenue("B", ipIdB, ipIdB, snapshotId1_ipIdB, 0n);
        });

        step("ipIdA claim revenue from vaultIpIdB", async function () {
            await claimRevenueByEOA("A", [snapshotId1_ipIdB], ipIdB, 0n);
        });

        step("ipIdB claim revenue from vaultIpIdB by IPA", async function () {
            await claimRevenueByIPA("B", [snapshotId1_ipIdB], ipIdB, ipIdB, 0n);
        });

        step("ipIdB claim revenue from vaultIpIdB by EOA", async function () {
            await claimRevenueByEOA("B", [snapshotId1_ipIdB], ipIdB, BigInt(payAmount + mintingFee));
        });

        step("Capture snapshotId for ipIdA", async function () {
            snapshotId1_ipIdA = await getSnapshotId("A", ipIdA);
        });

        step("ipIdA check claimable revenue from vaultIpIdA", async function () {
            await checkClaimableRevenue("A", ipIdA, ipIdA, snapshotId1_ipIdA, 0n);
        });

        step("ipIdA claim revenue from vaultIpIdA by IPA", async function () {
            await claimRevenueByIPA("A", [snapshotId1_ipIdA], ipIdA, ipIdA, 0n);
        });

        step("ipIdA claim revenue from vaultIpIdA by EOA", async function () {
            await claimRevenueByEOA("A", [snapshotId1_ipIdA], ipIdA, BigInt(mintingFee));
        });
    });
});
