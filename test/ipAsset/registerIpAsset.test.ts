import { privateKeyA, privateKeyB, privateKeyC, nftContractAddress } from '../../config/config';
import { registerIpAsset } from '../../utils/sdkUtils';
import { checkMintResult, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let ipIdA: string;

describe('SDK Test', function () {
    describe('Test ipAsset.register Function', async function () {
        before("Mint 2 NFTs to Wallet A",async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);            
            expect(tokenIdA).not.empty;
            
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdB);
            expect(tokenIdB).not.empty;
            
            tokenIdC = await mintNFTWithRetry(privateKeyC);
            checkMintResult(tokenIdC);
            expect(tokenIdC).not.empty;
        });

        it("Register an IP asset fail as non-existent NFT contract address", async function () {
            await expect(
                registerIpAsset("A","0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F48", tokenIdA, true)
            ).to.be.rejectedWith("Failed to register IP: The contract function \"register\" reverted.", "Error: IPAssetRegistry__UnsupportedIERC721(address contractAddress)");
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

        it("Owner can register an IP asset", async function () {
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

        it("Non-owner can register an IP asset", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdC, true)
            ).to.not.be.rejected;
        
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;
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