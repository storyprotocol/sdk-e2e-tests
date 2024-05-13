import { privateKeyA, nftContractAddress, arbitrationPolicyAddress } from '../../config/config';
import { mintNFTWithRetry, checkMintResult } from '../../utils/utils';
import { registerIpAsset, raiseDispute, cancelDispute } from '../../utils/sdkUtils';
import { Hex } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';

let tokenIdA: string;
let ipIdA: Hex;
let disputeId1: string;
let disputeId2: string;
let disputeId3: string;

describe("SDK Test", function () {
    describe("Test dispute.cancelDispute Function", async function () {
        before("Register IP assets and raise disputes", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);
            expect(tokenIdA).not.empty;

            const responseRegisterIpAsset = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;

            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpAsset.ipId;

            const responseRaiseDispute1 = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test1", "PLAGIARISM", true)
            ).to.not.be.rejected;

            expect(responseRaiseDispute1.txHash).to.be.a("string").and.not.empty;
            expect(responseRaiseDispute1.disputeId).to.be.a("bigint").and.to.be.ok;

            disputeId1 = responseRaiseDispute1.disputeId;

            const responseRaiseDispute2 = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test2", "PLAGIARISM", true)
            ).to.not.be.rejected;

            expect(responseRaiseDispute2.txHash).to.be.a("string").and.not.empty;
            expect(responseRaiseDispute2.disputeId).to.be.a("bigint").and.to.be.ok;

            disputeId2 = responseRaiseDispute2.disputeId;

            const responseRaiseDispute3 = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test3", "PLAGIARISM", true)
            ).to.not.be.rejected;

            expect(responseRaiseDispute3.txHash).to.be.a("string").and.not.empty;
            expect(responseRaiseDispute3.disputeId).to.be.a("bigint").and.to.be.ok;

            disputeId3 = responseRaiseDispute3.disputeId;
        });

        it("Cancel dispute fail as undefined disputeId", async function () {
            let disputeId1: any;
            const response = await expect(                
                cancelDispute("B", disputeId1, true)
            ).to.be.rejectedWith("Failed to cancel dispute: Cannot convert undefined to a BigInt");
        });

        it("Cancel dispute fail as invalid disputeId", async function () {
            const response = await expect(                
                cancelDispute("B", "test", true)
            ).to.be.rejectedWith("Failed to cancel dispute: Cannot convert test to a BigInt");
        });

        it("Cancel dispute fail as non-existent disputeId", async function () {
            const response = await expect(                
                cancelDispute("B", "999999", true)
            ).to.be.rejectedWith("Failed to cancel dispute: The contract function \"cancelDispute\" reverted.", 
                                 "Error: DisputeModule__NotInDisputeState()");
        });

        it("Cancel dispute with waitForTransaction: true", async function () {
            const response = await expect(                
                cancelDispute("B", disputeId1, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Cancel dispute with waitForTransaction: false", async function () {
            const response = await expect(                
                cancelDispute("B", disputeId2, false)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Cancel dispute with waitForTransaction: undefined", async function () {
            let waitForTransaction: any;
            const response = await expect(                
                cancelDispute("B", disputeId3, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Cancel dispute fail as already canceled", async function () {
            const response = await expect(
                cancelDispute("B", disputeId1, true)
            ).to.be.rejectedWith("Failed to cancel dispute: The contract function \"cancelDispute\" reverted.", 
                                 "Error: DisputeModule__NotInDisputeState()");
        });
    });
});