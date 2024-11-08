import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { createNFTCollection } from '../../utils/sdkUtils';
import { accountA, mockERC20Address } from '../../config/config';
import { Address } from 'viem';

describe("SDK Test", function () {
    describe("Create NFT Collection - nftClient.createNFTCollection", async function () {
        it("Create NFT collection", async function () {
            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.spgNftContract).to.be.a("string").and.not.empty;
        });

        it("Create NFT collection with empyt name and symbol", async function () {
            const response = await expect(
                createNFTCollection("A", "", "", true, true, accountA.address, "contract-uri", true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.spgNftContract).to.be.a("string").and.not.empty;
        });

        it("Create NFT collection with waitForTransaction: undefined", async function () {
            let waitForTransaction: any;
            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.spgNftContract).to.not.be.exist;
        });

        it("Create NFT collection with waitForTransaction: false", async function () {
            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", false)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.spgNftContract).to.not.be.exist;
        });

        it("Create NFT collection with optional parameters", async function () {
            const options = {
                baseURI: "base-uri",
                maxSupply: 100n,
                mintFee: 1,
                mintToken: mockERC20Address,
                owner: accountA.address as Address
            };

            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", true, "base-uri", 100, 1n, mockERC20Address, accountA.address)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.spgNftContract).to.be.a("string").and.not.empty;
        });         

        it("Create NFT collection with multi undefined parameters", async function () {
            let maxSupply: any;
            let mintFee: any;
            let mintToken: any;
            let owner: any;

            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", true, "base-uri", maxSupply, mintFee, mintToken, owner)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.spgNftContract).to.be.a("string").and.not.empty;
        });          

        it("Create NFT collection with invalid type for maxSupply", async function () {
            const maxSupply: any = "test";
            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", true, "base-uri", maxSupply)
            ).to.be.rejectedWith("Failed to create a SPG NFT collection: Cannot convert test to a BigInt");
        });         

        it("Create NFT collection with invalid type for owner", async function () {
            const owner = "0x0000";
            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", true, "", undefined, undefined, undefined, owner)
            ).to.be.rejectedWith(`Failed to create a SPG NFT collection: request.owner address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Create NFT collection with owner: 0x0000", async function () {
            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", true, "", undefined, undefined, undefined, "0x0000")
            ).to.be.rejectedWith(`Failed to create a SPG NFT collection: request.owner address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });          
    });
});
