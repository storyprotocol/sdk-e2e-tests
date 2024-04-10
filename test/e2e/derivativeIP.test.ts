import { privateKeyA, privateKeyB, accountB, privateKeyC, accountC, nftContractAddress } from '../../config/config'
import { mintNFT, captureConsoleLogs } from '../../utils/utils'
import { registerIpAsset, registerPILPolicy, addPolicyToIp, mintLicense, linkIpToParent } from '../../utils/sdkUtils'
import { expect } from 'chai'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import addContext = require("mochawesome/addContext");

let tokenIdA: any
let tokenIdB: any
let tokenIdC: any
let ipIdA: any
let ipIdB: any
let ipIdC: any
let policyId1: any
let policyId2: any
let licenseIdA: any
let licenseIdB: any

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function (){
    describe("Register IP Asset, Add Non-Commercial Policy to IP Asset, Mint License, Link IP asset to the parent IP asset", function(){
        // To print test results in test report
        let consoleLogs: string[] = [];
        beforeEach(function () {
            consoleLogs = captureConsoleLogs(consoleLogs)
        });

        afterEach(function () {
            if (consoleLogs.length > 0) {
                addContext(this, {
                    title: 'Test Result',
                    value: consoleLogs[0]
                });
            }
        });

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
    
            const responsePolicy1 = await expect(
                registerPILPolicy("A", true, waitForTransaction, policyOptions1)
            ).to.not.be.rejected;
    
            const responsePolicy2 = await expect(
                registerPILPolicy("A", true, waitForTransaction, policyOptions2)
            ).to.not.be.rejected;
    
            policyId1 = responsePolicy1.policyId
            policyId2 = responsePolicy2.policyId
        });
    
        describe.skip("[smoke]Link IP asset to the parent IP asset, root IP\'s policy allows derivatives (derivativesAllowed: true)", async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty    
            });
        
            step("Wallet A register an IP Asset with tokenIdA and get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdA = response.ipId
            });
        
            step("Add policy (policyId1) to the IP asset (ipIdA)", async function () {
                const response = await expect(
                    addPolicyToIp("A", ipIdA, policyId1, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.index).to.be.a("string");
                expect(response.index).not.empty;
            });
        
            step("Wallet A mint a license with the receiverAddress set as Wallet B, get a licenseId (licenseIdA)", async function () {
                const response = await expect(
                    mintLicense("A", policyId1, ipIdA, 5, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.licenseId).to.be.a("string");
                expect(response.licenseId).not.empty;
        
                licenseIdA = response.licenseId
            });        
        
            step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
                tokenIdB = await mintNFT(privateKeyB);
                expect(tokenIdB).not.empty
            });
        
            step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;

                ipIdB = response.ipId
            });

            step("ipIdB can link to ipIdA as its derivative IP Asset", async function () {
                const response = await expect(
                    linkIpToParent("B", [licenseIdA], ipIdB, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.success).to.be.true
            });
        
            step("Mint a NFT to WalletC and get a tokenId(tokenIdC)", async function () {
                tokenIdC = await mintNFT(privateKeyC);
                expect(tokenIdC).not.empty
            });
        
            step("Wallet C register an IP Asset with tokenIdC and get an ipId (ipIdC)", async function () {
                const response = await expect(
                    registerIpAsset("C", nftContractAddress, tokenIdC, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;

                ipIdC = response.ipId
            });
                                
            step("ipIdC can NOT link to ipIdA as it's derivative IP Asset", async function () {
                const response = await expect(
                    linkIpToParent("C", [licenseIdA], ipIdC, waitForTransaction)
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: LicensingModule__LinkParentParamFailed()");
            });
        });
        
        describe.skip('Link IP asset to the parent IP asset, root IP\'s policy allows derivatives (derivativesAllowed: false)', async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty
        
            });
        
            step("Wallet A register an IP Asset with tokenIdA, get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdA = response.ipId
            });
        
            step("Wallet A mint a license with the receiverAddress set as Wallet B, get a licenseId (licenseIdA)", async function () {
                const response = await expect(
                    mintLicense("A", policyId2, ipIdA, 5, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.licenseId).to.be.a("string");
                expect(response.licenseId).not.empty;
        
                licenseIdA = response.licenseId
            });        
        
            step("Mint a NFT to WalletB, get a tokenId (tokenidB)", async function () {
                tokenIdB = await mintNFT(privateKeyB);
                expect(tokenIdB).not.empty
            });
                    
            step("Wallet B register an IP Asset with tokenIdB, get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdB = response.ipId
            });
        
            step("ipIdB can NOT link to ipIdA as it's derivative IP Asset", async function () {
                const response = await expect(
                    linkIpToParent("B", [licenseIdA], ipIdB, waitForTransaction)
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: LicensingModule__LinkParentParamFailed()");
            });
        });
    
        describe.skip('Link IP asset to multiple parent IP assets', async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty    
            });
        
            step("Wallet A register an IP Asset with tokenIdA, get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected
    
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdA = response.ipId
            });
        
            step("Wallet A mint a license with the receiverAddress set as Wallet C, get a licenseId (licenseIdA)", async function () {
                const response = await expect(
                    mintLicense("A", policyId1, ipIdA, 5, accountC.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.licenseId).to.be.a("string");
                expect(response.licenseId).not.empty;
        
                licenseIdA = response.licenseId
            });       
        
            step("Mint a NFT to WalletB, get a tokenId (tokenIdB)", async function () {
                tokenIdB = await mintNFT(privateKeyB);
                expect(tokenIdB).not.empty
            });
    
            step("Wallet B register a root IP Asset with tokenIdB, get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdB = response.ipId
            });
        
            step("Wallet B mint a license with the receiverAddress set as Wallet C, get a licenseId (licenseIdB)", async function () {
                const response = await expect(
                    mintLicense("B", policyId1, ipIdB, 5, accountC.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.licenseId).to.be.a("string");
                expect(response.licenseId).not.empty;
        
                licenseIdB = response.licenseId
            });
            
            step("Mint a NFT to WalletC, get a tokenId (tokenIdC)", async function () {
                tokenIdC = await mintNFT(privateKeyC);
                expect(tokenIdC).not.empty
            });        

            step("Wallet C register an IP asset with tokenIdC and get ipIdC", async function () {
                const response = await expect(
                    registerIpAsset("C", nftContractAddress, tokenIdC, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;

                ipIdC = response.ipId
            });
                                
            step("ipIdC can link to ipIdA and ipIdB as their derivative IP Assets", async function () {
                const response = await expect(
                    linkIpToParent("C", [licenseIdA, licenseIdB], ipIdC, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.success).to.be.true
            });
        });
    
        describe.skip('Link IP asset to multiple parent IP assets, NotLicensee', async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty    
            });
        
            step("Wallet A register an IP Asset with tokenIdA, get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected
    
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdA = response.ipId
            });
        
            step("Wallet A mint a license with the receiverAddress set as Wallet B, get a licenseId (licenseIdA)", async function () {
                const response = await expect(
                    mintLicense("A", policyId1, ipIdA, 5, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.licenseId).to.be.a("string");
                expect(response.licenseId).not.empty;
        
                licenseIdA = response.licenseId
            });       
        
            step("Mint a NFT to WalletB, get a tokenId (tokenIdB)", async function () {
                tokenIdB = await mintNFT(privateKeyB);
                expect(tokenIdB).not.empty
            });
    
            step("Wallet B register an IP Asset with tokenIdB, get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdB = response.ipId
            });
        
            step("Wallet B mint a license with the receiverAddress set as Wallet C, get a licenseId (licenseIdB)", async function () {
                const response = await expect(
                    mintLicense("B", policyId1, ipIdB, 5, accountC.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.licenseId).to.be.a("string");
                expect(response.licenseId).not.empty;
        
                licenseIdB = response.licenseId
            });
            
            step("Mint a NFT to WalletC, get a tokenId (tokenIdC)", async function () {
                tokenIdC = await mintNFT(privateKeyC);
                expect(tokenIdC).not.empty
            });
            
            step("Wallet C register an IP Asset with tokenIdC, get an ipId (ipIdC)", async function () {
                const response = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdC, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdC = response.ipId
            });

            // Wallet C is not the licensee of licenseIdA
            step("ipIdC can NOT link to ipIdA and ipIdB as their derivative IP Asset", async function () {
                const response = await expect(
                    linkIpToParent("C", [licenseIdA, licenseIdB], ipIdC, waitForTransaction)
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: LicensingModule__NotLicensee()");
            });
        });

        describe("Link multiple IP asset to the parent IP asset, root IP\'s mintAmount is 1", async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty
            });
        
            step("Wallet A register an IP Asset with tokenIdA, the an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdA = response.ipId
            });
        
            step("Wallet A mint a license with ipIdA and get a licenseId (licenseIdA)", async function () {
                const response = await expect(
                    mintLicense("A", policyId1, ipIdA, 1, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.licenseId).to.be.a("string");
                expect(response.licenseId).not.empty;
        
                licenseIdA = response.licenseId
            });
        
            step("Mint a NFT to WalletB and get a tokenId (tokenIdB)", async function () {
                tokenIdB = await mintNFT(privateKeyB);
                expect(tokenIdB).not.empty
            });
        
            step("Wallet B register an IP Asset with tokenIdB, get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdB = response.ipId
            });

            step("ipIdB can link to ipIdA as it's derivative IP Asset", async function () {
                const response = await expect(
                    linkIpToParent("B", [licenseIdA], ipIdB, waitForTransaction)
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
                    registerIpAsset("B", nftContractAddress, tokenIdC, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdC = response.ipId
            });
        
            step("ipIdB can NOT link to ipIdA as it's derivative IP Asset", async function () {
                const response = await expect(
                    linkIpToParent("B", [licenseIdA], ipIdC, waitForTransaction)
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: LicensingModule__LinkParentParamFailed()");
            });
        }); 
    });
});
