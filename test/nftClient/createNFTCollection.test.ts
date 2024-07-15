import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { createNFTCollection } from '../../utils/sdkUtils';
import { accountA, mintingFeeTokenAddress } from '../../config/config';

describe("SDK Test", function () {
    describe("Create NFT Collection - nftClient.createNFTCollection", async function () {
        it("Create NFT collection", async function () {
            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.nftContract).to.be.a("string").and.not.empty;
        });

        it("Create NFT collection with empyt name and symbol", async function () {
            const response = await expect(
                createNFTCollection("A", "", "", true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.nftContract).to.be.a("string").and.not.empty;
        });

        it("Create NFT collection with waitForTransaction: undefined", async function () {
            let waitForTransaction: any;
            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.nftContract).to.not.be.exist;
        });

        it("Create NFT collection with waitForTransaction: false", async function () {
            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", false)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.nftContract).to.not.be.exist;
        });

        it("Create NFT collection with optional parameters", async function () {
            const options = {
                maxSupply: 100n,
                mintCost: 1,
                mintToken: mintingFeeTokenAddress,
                owner: accountA.address
            };

            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, options)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.nftContract).to.be.a("string").and.not.empty;
        });         

        it("Create NFT collection with multi undefined parameters", async function () {
            let maxSupply: any;
            let mintCost: any;
            let mintToken: any;
            let owner: any;

            const options = {
                maxSupply: maxSupply,
                mintCost: mintCost,
                mintToken: mintToken,
                owner: owner
            };

            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, options)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.nftContract).to.be.a("string").and.not.empty;
        });          

        it("Create NFT collection with invalid type for maxSupply", async function () {
            const options = {
                maxSupply: "test"
            };

            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, options)
            ).to.be.rejectedWith("Failed to create a SPG NFT collection: Cannot convert test to a BigInt");
        });         

        it("Create NFT collection with invalid type for owner", async function () {
            const options = {
                owner: "test"
            };

            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, options)
            ).to.be.rejectedWith(`Failed to create a SPG NFT collection: request.owner address is invalid: test, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Create NFT collection with owner: 0x0000", async function () {
            const options = {
                owner: "0x0000"
            };

            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, options)
            ).to.be.rejectedWith(`Failed to create a SPG NFT collection: request.owner address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });          
    });
});
