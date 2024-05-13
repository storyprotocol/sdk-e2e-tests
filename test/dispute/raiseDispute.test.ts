import { privateKeyA, nftContractAddress, arbitrationPolicyAddress } from '../../config/config';
import { mintNFTWithRetry, checkMintResult } from '../../utils/utils';
import { registerIpAsset, raiseDispute } from '../../utils/sdkUtils';
import { Hex } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';

const waitForTransaction: boolean = true;

let tokenIdA: string;
let ipIdA: Hex;

describe("SDK Test", function () {
    describe("Test dispute.raiseDispute Function", async function () {
        before("Register IP assets", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);
            expect(tokenIdA).not.empty;

            const responseRegisterIpAsset = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(responseRegisterIpAsset.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpAsset.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpAsset.ipId;
        });

        it("Raise dispute fail as undefined ipId", async function () {
            let ipIdA: any;
            const response = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
            ).to.be.rejectedWith("Failed to raise dispute: Address \"undefined\" is invalid.");
        });

        it("Raise dispute fail as invalid ipId", async function () {
            const response = await expect(
                raiseDispute("B", "0x0000", arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
            ).to.be.rejectedWith("Failed to raise dispute: Address \"0x0000\" is invalid.");
        });

        it("Raise dispute fail as non-existent ipId", async function () {
            const response = await expect(
                raiseDispute("B", "0x8Dcd7f0be38Be6adbe2a7d8fb58032b1e20E3681", arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
            ).to.be.rejectedWith("Failed to raise dispute: Address \"0x8Dcd7f0be38Be6adbe2a7d8fb58032b1e20E3681\" is invalid.");
        });

        it("Raise dispute fail as undefined linkToDisputeEvidence", async function () {
            let linkToDisputeEvidence: any;
            const response = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, linkToDisputeEvidence, "PLAGIARISM", waitForTransaction)
            ).to.be.rejectedWith("Failed to raise dispute: The contract function \"raiseDispute\" reverted.", 
                                    "Error: DisputeModule__ZeroLinkToDisputeEvidence()");
        });

        it("Raise dispute fail as empty linkToDisputeEvidence", async function () {
            const response = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "", "PLAGIARISM", waitForTransaction)
            ).to.be.rejectedWith("Failed to raise dispute: The contract function \"raiseDispute\" reverted.", 
                                    "Error: DisputeModule__ZeroLinkToDisputeEvidence()");
        });

        it("Raise dispute fail as undefined targetTag", async function () {
            let targetTag: any; 
            const response = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test", targetTag, waitForTransaction)
            ).to.be.rejectedWith("Failed to raise dispute: The contract function \"raiseDispute\" reverted.", 
                                    "DisputeModule__NotWhitelistedDisputeTag()");
        });

        it("Raise dispute fail as unwhitelisted targetTag", async function () {
            let targetTag: any; 
            const response = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test", "test", waitForTransaction)
            ).to.be.rejectedWith("Failed to raise dispute: The contract function \"raiseDispute\" reverted.", 
                                    "Error: DisputeModule__NotWhitelistedDisputeTag()");
        });

        it("Raise dispute with undefined arbitrationPolicyAddress", async function () {
            let arbitrationPolicyAddress: any;
            const response = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test", "PLAGIARISM", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.disputeId).to.be.a("bigint").and.to.be.ok;
        });

        it("Raise dispute with invalid arbitrationPolicyAddress", async function () {
            const response = await expect(
                raiseDispute("B", ipIdA, "0x0000", "test", "PLAGIARISM", waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.disputeId).to.be.a("bigint").and.to.be.ok;
        });

        it("Raise dispute", async function () {
            const response = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test1", "PLAGIARISM", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.disputeId).to.be.a("bigint").and.to.be.ok;
        });

        it("Raise dispute one more time", async function () {
            const response = await expect(
                raiseDispute("B", ipIdA, arbitrationPolicyAddress, "test1", "PLAGIARISM", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.disputeId).to.be.a("bigint").and.to.be.ok;
        });

        it("Raise dispute with undefined waitForTransaction", async function () {
            let waitForTransaction: any;
            const response = await expect(
                raiseDispute("A", ipIdA, arbitrationPolicyAddress, "test2", "PLAGIARISM", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.disputeId).to.not.exist;
        });

        it("Raise dispute with waitForTransaction: true", async function () {
            const response = await expect(
                raiseDispute("A", ipIdA, arbitrationPolicyAddress, "test3", "PLAGIARISM", true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.disputeId).to.be.a("bigint").and.to.be.ok;
        });

        it("Raise dispute with undefined waitForTransaction: false", async function () {
            const response = await expect(
                raiseDispute("A", ipIdA, arbitrationPolicyAddress, "test4", "PLAGIARISM", false)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.disputeId).to.not.exist;
        });
    });
});