import { privateKeyA, privateKeyB, privateKeyC, nftContractAddress } from '../../config/config';
import { registerIpAsset } from '../../utils/sdkUtils';
import { checkMintResult, isRegistered, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Address } from 'viem';

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let ipIdA: Address;

describe('SDK Test', function () {
    describe('Test ipAsset.register Function', async function () {
        before("Mint 3 NFTs to Wallet A", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);            
            
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            checkMintResult(tokenIdB);
            
            tokenIdC = await mintNFTWithRetry(privateKeyC);
            checkMintResult(tokenIdC);
        });

        // 0x1033cd88 - IPAssetRegistry__UnsupportedIERC721(address)
        it("Register an IP asset fail as non-existent NFT contract address", async function () {
            await expect(
                registerIpAsset("A","0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F48", tokenIdA, true)
            ).to.be.rejectedWith(`Failed to register IP: The contract function "registerIp" reverted with the following signature:`, "0x1033cd88");
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

        // 0x7e273289 - ERC721NonexistentToken(uint256)
        it("Register an IP asset fail as empty tokenId", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, " ", true)
            ).to.be.rejectedWith(`Failed to register IP: The contract function "registerIp" reverted with the following signature:`, "0x7e273289");
        });      

        it("Owner can register an IP asset", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;
        
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;

            // call contract to check isRegistered
            const checkIpIdRegistered = await isRegistered(ipIdA);
            expect(checkIpIdRegistered).to.be.equal(true);
        }); 

        it("Register an IP asset that is already registered", async function () {            
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected;
        
            expect(response.txHash).not.to.be.exist;
            expect(response.ipId).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.equal(ipIdA);
        });

        // 0xb3e96921 - AccessController__PermissionDenied(address,address,address,bytes4)
        it("Non-owner can register an IP asset", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdC, true)
            ).to.be.rejectedWith(`Failed to register IP: The contract function "registerIp" reverted with the following signature:`, `0xb3e96921`)
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
