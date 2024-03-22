import { accountB, nftContractAddress, privateKeyA, privateKeyB } from '../../config/config';
import { mintLicense, registerDerivativeIp, registerRootIp } from '../../utils/sdkUtils';
import { mintNFT } from '../../utils/utils';
import { before, it } from 'mocha';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

let tokenIdA: any
let tokenIdB: any
let tokenIdC: any
let tokenIdD: any
let ipIdA: any
let licenseIdA: any

describe('SDK Test', function () {
    describe('Test ipAsset.registerRootIp Function', async function () {
        before("Mint a NFT to Wallet A",async function () {
            tokenIdA = await mintNFT(privateKeyA);            
            expect(tokenIdA).not.empty
            
            tokenIdB = await mintNFT(privateKeyB);
            expect(tokenIdB).not.empty 
        });

        it("Register a root IP asset fail as non-existent policy id", async function () {
            const response = await expect(
                registerRootIp("A", "999", nftContractAddress, tokenIdA, true)
            ).to.be.rejectedWith("Failed to register root IP: The contract function \"registerRootIp\" reverted.", 
                                 "Error: LicensingModule__PolicyNotFound()")
        });

        it("Register a root IP asset fail as ivalid policy id", async function () {
            const response = await expect(
                registerRootIp("A", "policyId", nftContractAddress, tokenIdA, true)
            ).to.be.rejectedWith("Failed to register root IP: Cannot convert policyId to a BigInt")
        });

        it("Register a root IP asset fail as non-existent NFT contract address", async function () {
            const response = await expect(
                registerRootIp("A", "1", "0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F48", tokenIdA, true)
            ).to.be.rejectedWith("Failed to register root IP: Execution reverted for an unknown reason.")
        });

        it("Register a root IP asset fail as invalid NFT contract address", async function () {
            const response = await expect(
                registerRootIp("A", "1", "0x7ee32b8B515dEE", tokenIdA, true)
            ).to.be.rejectedWith("Failed to register root IP: Address \"0x7ee32b8B515dEE\" is invalid.")
        });

        it("Register a root IP asset fail as invalid tokenId", async function () {
            const response = await expect(
                registerRootIp("A", "1", nftContractAddress, "tokenid", true)
            ).to.be.rejectedWith("Failed to register root IP: Cannot convert tokenid to a BigInt")
        });

        it("Register a root IP asset fail as invalid owner", async function () {
            const response = await expect(
                registerRootIp("B", "1", nftContractAddress, tokenIdA, true)
            ).to.be.rejectedWith("Failed to register root IP: The contract function \"registerRootIp\" reverted.", 
                                     "Error: RegistrationModule__InvalidOwner()")
        });        

        it("Register a root IP asset", async function () {
            const response = await expect(
                registerRootIp("A", "1", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected
        
            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;
        });

        it("Register a root IP asset that is already registered", async function () {            
            const response = await expect(
                registerRootIp("A", "1", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected
        
            expect(response.txHash).not.to.be.exist;
            expect(response.ipId).to.be.exist;
            expect(response.ipId).to.be.a("string");

            ipIdA = response.ipId
        });

        it("Register a root IP asset with waitForTransaction: false", async function () {
            const response = await expect(
                registerRootIp("B", "1", nftContractAddress, tokenIdB, false)
            ).to.not.be.rejected
        
            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).not.to.be.exist
        });
    });

    describe('Test ipAsset.registerDerivativeIp Function', async function () {
        before("Mint a NFT to Wallet A", async function () {
            const response = await expect(
                mintLicense("A", "1", ipIdA, accountB.address, true)
            ).to.not.be.rejected;
    
            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.licenseId).to.be.a("string");
            expect(response.licenseId).not.empty;
    
            licenseIdA = response.licenseId

            tokenIdC = await mintNFT(privateKeyB);
            expect(tokenIdC).not.empty
            
            tokenIdD = await mintNFT(privateKeyA);
            expect(tokenIdD).not.empty
        });

        it("Register a derivative IP asset fail as non-existent license id", async function () {
            const response = await expect(
                registerDerivativeIp("B", ["99999999"], nftContractAddress, tokenIdC, true)
            ).to.be.rejectedWith("Failed to register derivative IP: Cannot read properties of null (reading 'licensorIpId')")
        });

        it("Register a derivative IP asset fail as ivalid license id", async function () {
            const response = await expect(
                registerDerivativeIp("B", ["licenseId"], nftContractAddress, tokenIdC, true)
            ).to.be.rejectedWith("Failed to register derivative IP: Cannot convert licenseId to a BigInt")
        });

        it("Register a derivative IP asset fail as non-existent NFT contract address", async function () {
            const response = await expect(
                registerDerivativeIp("B", [licenseIdA], "0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F48", tokenIdC, true)
            ).to.be.rejectedWith("Failed to register root IP: Execution reverted for an unknown reason.")
        });

        it("Register a derivative IP asset fail as invalid NFT contract address", async function () {
            const response = await expect(
                registerDerivativeIp("B", [licenseIdA], "0x7ee32b8B515dEE", tokenIdC, true)
            ).to.be.rejectedWith("Failed to register derivative IP: Address \"0x7ee32b8B515dEE\" is invalid.")
        });

        it("Register a derivative IP asset fail as invalid tokenId", async function () {
            const response = await expect(
                registerDerivativeIp("B", [licenseIdA], nftContractAddress, "tokenid", true)
            ).to.be.rejectedWith("Failed to register derivative IP: Cannot convert tokenid to a BigInt")
        });

        it("Register a derivative IP asset fail as invalid owner", async function () {
            const response = await expect(
                registerDerivativeIp("A", [licenseIdA], nftContractAddress, tokenIdC, true)
            ).to.not.be.rejectedWith("Failed to register derivative IP: The contract function \"registerDerivativeIp\" reverted.", 
                                     "Error: RegistrationModule__InvalidOwner()")
        });

        it("Register a derivative IP asset", async function () {
            const response = await expect(
                registerDerivativeIp("B", [licenseIdA], nftContractAddress, tokenIdC, true)
            ).to.not.be.rejected
        
            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;
        });

        it("Register a derivative IP asset that is already registered", async function () {            
            const response = await expect(
                registerDerivativeIp("B", [licenseIdA], nftContractAddress, tokenIdC, true)
            ).to.not.be.rejected
        
            expect(response.txHash).not.to.be.exist;
            expect(response.ipId).to.be.exist;
            expect(response.ipId).to.be.a("string");
        });

        it("Register a derivative IP asset with waitForTransaction: false", async function () {
            const response = await expect(
                registerDerivativeIp("A", [licenseIdA], nftContractAddress, tokenIdD, false)
            ).to.not.be.rejected
        
            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).not.to.be.exist
        });
    });
});