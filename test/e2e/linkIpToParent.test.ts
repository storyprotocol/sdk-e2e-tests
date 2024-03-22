import { privateKeyA, privateKeyB, accountB, nftContractAddress, privateKeyC } from '../../config/config'
import { mintNFT } from '../../utils/utils'
import { registerRootIp, mintLicense, linkIpToParent, registerPILPolicy } from '../../utils/sdkUtils'
import { expect } from 'chai'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

let tokenIdA: any
let tokenIdB: any
let tokenIdC: any
let ipIdA: any
let ipIdB: any
let ipIdC: any
let licenseId: any
let policyId1: any
let policyId2: any
let policyId3: any

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function () {
    describe("Link IP to Parent IP Asset", async function () {
        before("Create 2 policies with parameter derivativesAllowed: true and false",async function () {
            const policyOptions1 = {
                attribution: true,
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesReciprocal: true
            }
    
            const policyOptions2 = {
                attribution: true,
                derivativesAllowed: false
            }

            const policyOptions3 = {
                attribution: true,
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesReciprocal: false
            }
    
            const responsePolicy1 = await expect(
                registerPILPolicy("A", true, waitForTransaction, policyOptions1)
            ).to.not.be.rejected;
    
            const responsePolicy2 = await expect(
                registerPILPolicy("A", true, waitForTransaction, policyOptions2)
            ).to.not.be.rejected;
    
            const responsePolicy3 = await expect(
                registerPILPolicy("A", true, waitForTransaction, policyOptions3)
            ).to.not.be.rejected;
    
            policyId1 = responsePolicy1.policyId
            policyId2 = responsePolicy2.policyId
            policyId3 = responsePolicy3.policyId
        });

        describe.skip("Link an IP asset to the parent IP asset, root IP\'s policy allows derivatives (derivativesAllowed: true)", async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty
            });
        
            step("Wallet A register a root IP Asset with tokenIdA, the an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerRootIp("A", policyId1, nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdA = response.ipId
            });
        
            step("Wallet A mint a license with ipIdA and get a licenseId", async function () {
                const response = await expect(
                    mintLicense("A", policyId1, ipIdA, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.licenseId).to.be.a("string");
                expect(response.licenseId).not.empty;
        
                licenseId = response.licenseId
            });
        
            step("Mint a NFT to WalletB and get a tokenId (tokenIdB)", async function () {
                tokenIdB = await mintNFT(privateKeyB);
                expect(tokenIdB).not.empty
            });
        
            step("Wallet B register a root IP Asset with tokenIdB, get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerRootIp("B", policyId2, nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdB = response.ipId
            });
        
            step("ipIdB can link to ipIdA as it's derivative IP Asset", async function () {
                const response = await expect(
                    linkIpToParent("B", [licenseId], ipIdB, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.success).to.be.true
            });
        });

        describe.skip("Link an IP asset to the parent IP asset, root IP\'s policy allows derivatives (derivativesAllowed: false)", async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty
            });
        
            step("Wallet A register a root IP Asset with tokenIdA, the an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerRootIp("A", policyId2, nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdA = response.ipId
            });
        
            step("Wallet A mint a license with ipIdA and get a licenseId", async function () {
                const response = await expect(
                    mintLicense("A", policyId2, ipIdA, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.licenseId).to.be.a("string");
                expect(response.licenseId).not.empty;
        
                licenseId = response.licenseId
            });
        
            step("Mint a NFT to WalletB and get a tokenId (tokenIdB)", async function () {
                tokenIdB = await mintNFT(privateKeyB);
                expect(tokenIdB).not.empty
            });
        
            step("Wallet B register a root IP Asset with tokenIdB, get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerRootIp("B", policyId1, nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdB = response.ipId
            });
        
            step("ipIdB can NOT link to ipIdA as it's derivative IP Asset", async function () {
                const response = await expect(
                    linkIpToParent("B", [licenseId], ipIdB, waitForTransaction)
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: LicensingModule__LinkParentParamFailed()");
            });
        });

        describe("Link multiple IP asset to the parent IP asset, root IP\'s mintAmount is 1", async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty
            });
        
            step("Wallet A register a root IP Asset with tokenIdA, the an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerRootIp("A", policyId1, nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdA = response.ipId
            });
        
            step("Wallet A mint a license with ipIdA and get a licenseId", async function () {
                const response = await expect(
                    mintLicense("A", policyId1, ipIdA, 1, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.licenseId).to.be.a("string");
                expect(response.licenseId).not.empty;
        
                licenseId = response.licenseId
            });
        
            step("Mint a NFT to WalletB and get a tokenId (tokenIdB)", async function () {
                tokenIdB = await mintNFT(privateKeyB);
                expect(tokenIdB).not.empty
            });
        
            step("Wallet B register a root IP Asset with tokenIdB, get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerRootIp("B", policyId2, nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdB = response.ipId
            });

            step("ipIdB can link to ipIdA as it's derivative IP Asset", async function () {
                const response = await expect(
                    linkIpToParent("B", [licenseId], ipIdB, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.success).to.be.true
            });

            step("Mint a NFT to WalletB and get a tokenId (tokenIdB)", async function () {
                tokenIdC = await mintNFT(privateKeyB);
                expect(tokenIdC).not.empty
            });
        
            step("Wallet B register a root IP Asset with tokenIdC, get an ipId (ipIdC)", async function () {
                const response = await expect(
                    registerRootIp("B", policyId3, nftContractAddress, tokenIdC, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdC = response.ipId
            });
        
            step("ipIdB can NOT link to ipIdA as it's derivative IP Asset", async function () {
                const response = await expect(
                    linkIpToParent("B", [licenseId], ipIdC, waitForTransaction)
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: LicensingModule__LinkParentParamFailed()");
            });
        });  
    });
});