import { nftContractAddress, privateKeyA, privateKeyB } from '../../config/config';
import { registerIpAsset } from '../../utils/sdkUtils';
import { mintNFT } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

let tokenIdA: string
let tokenIdB: string
let ipIdA: string

describe('SDK Test', function () {
    describe('Test ipAsset.register Function', async function () {
        before("Mint two NFT to Wallet A",async function () {
            tokenIdA = await mintNFT(privateKeyA);            
            expect(tokenIdA).not.empty;
            
            tokenIdB = await mintNFT(privateKeyB);
            expect(tokenIdB).not.empty;
        });

        it("Register an IP asset fail as non-existent NFT contract address", async function () {
            await expect(
                registerIpAsset("A","0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F48", tokenIdA, true)
            ).to.be.rejectedWith("Failed to register IP: Address \"0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F48\" is invalid.");
        });

        it("Register an IP asset fail as invalid NFT contract address", async function () {
            await expect(
                registerIpAsset("A", "0x000000", tokenIdA, true)
            ).to.be.rejectedWith("Failed to register IP: Address \"0x000000\" is invalid.");
        });

        it("Register an IP asset fail as invalid tokenId", async function () {
            await expect(
                registerIpAsset("A", nftContractAddress, "tokenid", true)
            ).to.be.rejectedWith("Cannot convert tokenid to a BigInt");
        });

        it("Register an IP asset fail as empty tokenId", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, " ", true)
            ).to.be.rejectedWith("Failed to register IP: The contract function \"register\" reverted with the following signature");
        });

        // rc12 - non-owner can register IP asset
        it.skip("Register an IP asset fail as non-owner", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdA, true)
            ).to.be.rejectedWith("Failed to register IP: The contract function \"registerRootIp\" reverted.", 
                                 "Error: RegistrationModule__InvalidOwner()");
        });        

        it("Register an IP asset", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;
        
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;
        });

        it("Register an IP asset that is already registered", async function () {            
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;
        
            expect(response.txHash).not.to.be.exist;
            expect(response.ipId).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.equal(ipIdA);
        });

        it("Register a root IP asset with waitForTransaction: false", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, false)
            ).to.not.be.rejected;
        
            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).not.to.be.exist;
        });
    });
});