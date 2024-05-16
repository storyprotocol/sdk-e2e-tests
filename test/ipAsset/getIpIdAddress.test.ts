import { nftContractAddress, privateKeyA } from '../../config/config';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { getIpIdAddress, registerIpAsset } from '../../utils/sdkUtils';
import { checkMintResult, mintNFTWithRetry } from '../../utils/utils';
import { Address } from 'viem';

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Address;

describe("SDK Test", function () {
    describe("Get IpId Address - ipAsset.getIpIdAddress", async function () {
        before("Mint NFT and register IP asset",async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);            
            
            const responseRegisterIpA = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;

            expect(responseRegisterIpA.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpA.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpA.ipId;
            
            tokenIdB = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdB);
        })

        describe("Get IpId Address - Positive tests", async function () {
            it("Owner gets IpId Address", async function () {
                const response = await expect(
                    getIpIdAddress("A", nftContractAddress, tokenIdA)
                ).to.not.be.rejected;

                expect(response).to.be.a("string").and.to.be.equal(ipIdA);
            });

            it("Non-owner gets IpId Address", async function () {
                const response = await expect(
                    getIpIdAddress("B", nftContractAddress, tokenIdA)
                ).to.not.be.rejected;

                expect(response).to.be.a("string").and.to.be.equal(ipIdA);
            });              

            it("Get IpId Address for a tokenId that has not registered IP asset", async function () {
                const response = await expect(
                    getIpIdAddress("A", nftContractAddress, tokenIdB)
                ).to.not.be.rejected;

                expect(response).to.be.a("string").and.not.to.be.empty;
            });              

            it("Get IpId Address for a non-existent tokenId", async function () {
                const response = await expect(
                    getIpIdAddress("A", nftContractAddress, "999999")
                ).to.not.be.rejected;

                expect(response).to.be.a("string").and.not.to.be.empty;
            });              
        });

        describe("Get IpId Address - Negative tests", async function () {
            it("Get IpId Address with undefined nftContractAddress", async function () {
                let nftContractAddress: any;
                const response = await expect(
                    getIpIdAddress("A", nftContractAddress, tokenIdA)
                ).to.be.rejectedWith("Address \"undefined\" is invalid.");
            });

            it("Get IpId Address with invalid nftContractAddress", async function () {
                const response = await expect(
                    getIpIdAddress("B", "0x0000", tokenIdA)
                ).to.be.rejectedWith("Address \"0x0000\" is invalid.");
            });               

            it("Get IpId Address with undefined tokenId", async function () {
                let tokenId: any;
                const response = await expect(
                    getIpIdAddress("B", nftContractAddress, tokenId)
                ).to.be.rejectedWith("Cannot convert undefined to a BigInt");
            });               

            it("Get IpId Address with invalid tokenId", async function () {
                const response = await expect(
                    getIpIdAddress("B", nftContractAddress, "test")
                ).to.be.rejectedWith("Cannot convert test to a BigInt");
            });                                       
        });
    });
});
