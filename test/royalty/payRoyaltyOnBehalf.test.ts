import { privateKeyA, privateKeyB, privateKeyC, nftContractAddress, mintingFeeTokenAddress } from '../../config/config';
import { mintNFTWithRetry, checkMintResult, sleep } from '../../utils/utils';
import { registerIpAsset, payRoyaltyOnBehalf, attachLicenseTerms, registerDerivative } from '../../utils/sdkUtils';
import { Hex } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { comUseLicenseTermsId1 } from '../setup';

const waitForTransaction: boolean = true;

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let ipIdA: Hex;
let ipIdB: Hex;
let ipIdC: Hex;

describe("SDK Test", function () {
    describe("Test royalty.payRoyaltyOnBehalf Function", async function () {
        before("Register parent and derivative IP assets", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);

            const responseRegisterIpAsset = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpAsset.ipId;

            const responseAttachLicenseTerms = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseAttachLicenseTerms.txHash).to.be.a("string").and.not.empty;

            tokenIdB = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdB);

            const responseregisterIpAssetB = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseregisterIpAssetB.txHash).to.be.a("string").and.not.empty;
            expect(responseregisterIpAssetB.ipId).to.be.a("string").and.not.empty;

            ipIdB = responseregisterIpAssetB.ipId;

            const response = await expect(
                registerDerivative("B", ipIdB, [ipIdA], [comUseLicenseTermsId1], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;

            tokenIdC = await mintNFTWithRetry(privateKeyC);
            checkMintResult(tokenIdC);

            const responseregisterIpAssetC = await expect(
                registerIpAsset("C", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            ipIdC = responseregisterIpAssetC.ipId;
        });

        it("Pay royalty on behalf fail as undefined receiverIpId", async function () {
            let receiverIpId: any;
            const response = await expect(
                payRoyaltyOnBehalf("B", receiverIpId, ipIdB, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: Address \"undefined\" is invalid.");
        });

        it("Pay royalty on behalf fail as invalid receiverIpId", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("B", "0x0000", ipIdB, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: Address \"0x0000\" is invalid.");
        });

        it("Pay royalty on behalf fail as non-existent receiverIpId", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("B", "0xe967f54D03acc01CF624b54e0F24794a2f8f229a", ipIdB, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: The receiver IP with id 0xe967f54D03acc01CF624b54e0F24794a2f8f229a is not registered.");
        });

        it("Pay royalty on behalf fail as undefined payerIpId", async function () {
            let payerIpId: any;
            const response = await expect(
                payRoyaltyOnBehalf("B", ipIdA, payerIpId, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: Address \"undefined\" is invalid.");
        });

        it("Pay royalty on behalf fail as invalid payerIpId", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("B", ipIdA, "0x0000", mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: Address \"0x0000\" is invalid.");
        });

        it("Pay royalty on behalf fail as non-existent payerIpId", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("B", ipIdA, "0xe967f54D03acc01CF624b54e0F24794a2f8f229b", mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: The payer IP with id 0xe967f54D03acc01CF624b54e0F24794a2f8f229b is not registered.");
        });

        it("Pay royalty on behalf fail as undefined token address", async function () {
            let mintingFeeTokenAddress: any;
            const response = await expect(
                payRoyaltyOnBehalf("B", ipIdA, ipIdB, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: Address \"undefined\" is invalid.");
        });

        it("Pay royalty on behalf fail as invalid token address", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("B", ipIdA, ipIdB, "0x0000", "100", waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: Address \"0x0000\" is invalid");
        });

        it("Pay royalty on behalf fail as non-existent token address", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("B", ipIdA, ipIdB, "0xe967f54D03acc01CF624b54e0F24794a2f8f229c", "100", waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: The contract function \"payRoyaltyOnBehalf\" reverted.", "Error: RoyaltyModule__NotWhitelistedRoyaltyToken()");
        });

        it("Pay royalty on behalf fail as undefined pay amount", async function () {
            let amount: any;
            const response = await expect(
                payRoyaltyOnBehalf("B", ipIdA, ipIdB, mintingFeeTokenAddress, amount, waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: Cannot convert undefined to a BigInt");
        });

        it("Pay royalty on behalf fail as invalid pay amount", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("B", ipIdA, ipIdB, mintingFeeTokenAddress, "test", waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: Cannot convert test to a BigInt");
        });

        it("Pay royalty on behalf with waitForTransaction: true", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("B", ipIdA, ipIdB, mintingFeeTokenAddress, "100", true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;;
        });

        it("Pay royalty on behalf with waitForTransaction: false", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("C", ipIdA, ipIdB, mintingFeeTokenAddress, "100", false)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Pay royalty on behalf with waitForTransaction: undefined", async function () {
            let waitForTransaction: any;
            const response = await expect(
                payRoyaltyOnBehalf("C", ipIdA, ipIdB, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Pay royalty on behalf by non-owner", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("C", ipIdA, ipIdB, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Pay royalty on behalf fail as payer is parent IP", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("A", ipIdB, ipIdA, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.be.rejectedWith("Failed to pay royalty on behalf: The contract function \"payRoyaltyOnBehalf\" reverted.", 
                                 "Error: RoyaltyModule__NoRoyaltyPolicySet()");
        });

        it("Pay royalty on behalf - derivate IP to parent IP", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("A", ipIdA, ipIdB, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Pay royalty on behaf - derivate IP to any unrelated IP", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("A", ipIdC, ipIdB, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Pay royalty on behalf - any unrelated IP to parent IP", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("A", ipIdA, ipIdC, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Pay royalty on behalf - any unrelated IP to derivative IP", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("A", ipIdB, ipIdC, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Pay royalty on behalf - same receiver and payer", async function () {
            const response = await expect(
                payRoyaltyOnBehalf("C", ipIdB, ipIdB, mintingFeeTokenAddress, "100", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });
    });
});