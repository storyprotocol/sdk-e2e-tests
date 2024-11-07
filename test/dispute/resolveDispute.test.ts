import { privateKeyA, nftContractAddress, arbitrationPolicyAddress, privateKeyC } from '../../config/config';
import { mintNFTWithRetry, checkMintResult, setDisputeJudgement, sleep } from '../../utils/utils';
import { registerIpAsset, raiseDispute, resolveDispute } from '../../utils/sdkUtils';
import { Address } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';

let tokenIdA: string;
let ipIdA: Address;
let disputeId1: bigint;
let disputeId2: bigint;

describe("SDK Test", function () {
    describe("Test dispute.resolveDispute Function", async function () {
        before("Register IP assets and raise disputes", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);

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
            expect(responseRaiseDispute1.disputeId).to.be.a("bigint").and.to.be.ok;

            disputeId2 = responseRaiseDispute2.disputeId;            
        });

        it("Resolve dispute fail as undefined disputeId", async function () {
            let disputeId1: any;
            const response = await expect(                
                resolveDispute("B", disputeId1, "0x", true)
            ).to.be.rejectedWith(`Failed to resolve dispute: Cannot convert undefined to a BigInt`);
        });

        it("Resolve dispute fail as invalid disputeId", async function () {
            const response = await expect(                
                resolveDispute("B", "test", "0x", true)
            ).to.be.rejectedWith(`Failed to resolve dispute: Cannot convert test to a BigInt`);
        });

        it("Resolve dispute fail as non-existent disputeId", async function () {
            const response = await expect(                
                resolveDispute("B", "999999", "0x", true)
            ).to.be.rejectedWith(`Failed to resolve dispute: The contract function "resolveDispute" reverted.`, 
                                 `Error: DisputeModule__NotDisputeInitiator()`);
        });

        it("Resolve dispute fail as undefined data", async function () {
            let data: any;
            const response = await expect(                
                resolveDispute("B", disputeId1, data, true)
            ).to.be.rejectedWith(`Failed to resolve dispute: Cannot read properties of undefined (reading 'length')`);
        });

        it("Resolve dispute fail as not dispute initiator", async function () {
            const response = await expect(                
                resolveDispute("A", disputeId1, "0x", true)
            ).to.be.rejectedWith(`Failed to resolve dispute: The contract function "resolveDispute" reverted.`, 
                                 `Error: DisputeModule__NotDisputeInitiator()`);
        });

        it("Resolve dispute fail as not set judgement", async function () {
            const response = await expect(                              
                resolveDispute("B", disputeId1, "0x0000", true)
            ).to.be.rejectedWith(`Failed to resolve dispute: The contract function "resolveDispute" reverted.`, 
                                 `Error: DisputeModule__NotAbleToResolve()`);
        });

        it("Resolve dispute fail as judgement decision is false", async function () {
            await setDisputeJudgement(privateKeyC, disputeId1, false, "0x");
            await sleep(10);

            const response = await expect(                              
                resolveDispute("B", disputeId1, "0x0000", true)
            ).to.be.rejectedWith(`Failed to resolve dispute: The contract function "resolveDispute" reverted.`, 
                                 `Error: DisputeModule__NotAbleToResolve()`);
        });

        it("Resolve dispute faile as already resolved", async function () {
            const response = await expect(                
                resolveDispute("B", disputeId1, "0x0000", false)
            ).to.be.rejectedWith(`Failed to resolve dispute: The contract function "resolveDispute" reverted.`, 
                                 `Error: DisputeModule__NotAbleToResolve()`);
        });

        it("Resolve dispute with waitForTransaction: false", async function () {
            await setDisputeJudgement(privateKeyC, disputeId2, true, "0x");
            await sleep(10);

            const response = await expect(                              
                resolveDispute("B", disputeId2, "0x0000", false)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });
    });
});
