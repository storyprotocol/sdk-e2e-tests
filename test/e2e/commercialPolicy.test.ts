import { privateKeyA, privateKeyB, accountB, privateKeyC, royaltyPolicyLAPAddress, nftContractAddress } from '../../config/config'
import { mintNFT, captureConsoleLogs } from '../../utils/utils'
import { registerIpAsset, registerPILPolicy, mintLicense, linkIpToParent } from '../../utils/sdkUtils'
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

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function (){
    describe("Register Root IP and Derivative IP Asset with Commercial Policy", function(){
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

        before("Create 2 commercial policies",async function () {
            const policyOptions1 = {
                royaltyPolicy: royaltyPolicyLAPAddress,
                commercialRevShare: 300,
                attribution: true,
                commercialUse: true,
                commercialAttribution: true,
                derivativesAllowed: true,
                derivativesReciprocal: true
            }
    
            const policyOptions2 = {
                royaltyPolicy: royaltyPolicyLAPAddress,
                commercialRevShare: 600,
                attribution: true,
                commercialUse: true,
                commercialAttribution: true,
                derivativesAllowed: false,
                derivativesReciprocal: false
            }
    
            policyId1 = (await registerPILPolicy("A", true, waitForTransaction, policyOptions1)).policyId;
            policyId2 = (await registerPILPolicy("A", true, waitForTransaction, policyOptions2)).policyId;
        });
    
        describe("[smoke]Register a derivative IP asset, root IP\'s policy allows derivatives (derivativesAllowed: true)", async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty    
            });

            step("Wallet A register a root IP Asset with tokenIdA and policyId1, get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;
        
                ipIdA = response.ipId
            });
        
            step("Wallet A mint a license with the receiverAddress set as Wallet B, get a licenseId (licenseIdA)", async function () {
                const response = await expect(
                    mintLicense("A", policyId1, ipIdA, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
        
                licenseIdA = response.licenseId
            });        
        
            step("Mint a NFT to WalletB, get a tokenId (tokenIdB)", async function () {
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
        
            step("Wallet B can register a derivative IP asset with licenseIdA and tokenIdB", async function () {
                const response = await expect(
                    linkIpToParent("B", [licenseIdA], ipIdB, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true;
            });
        
            step("Mint a NFT to WalletC and get a tokenId(tokenIdC)", async function () {
                tokenIdC = await mintNFT(privateKeyC);
                expect(tokenIdC).not.empty
            });
                        
            step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerIpAsset("C", nftContractAddress, tokenIdC, waitForTransaction)
                ).to.not.be.rejected;
                        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
                
                ipIdC = response.ipId
            });  
        
            step("Wallet C can NOT register a derivative IP asset with licenseIdA and tokenIdC", async function () {
                await expect(
                    linkIpToParent("C", [licenseIdA], ipIdC, waitForTransaction)
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: LicensingModule__NotLicensee()");
            });
        });
        
        describe('[smoke]Register a derivative IP asset, root IP\'s policy allows derivatives (derivativesAllowed: false)', async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty;        
            });
        
            step("Wallet A register a root IP Asset with tokenIdA and policyId2, get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;
        
                ipIdA = response.ipId;
            });
        
            step("Wallet A mint a license with the receiverAddress set as Wallet B, get a licenseId (licenseIdA)", async function () {
                const response = await expect(
                    mintLicense("A", policyId2, ipIdA, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
        
                licenseIdA = response.licenseId;
            });        
        
            step("Mint a NFT to WalletB, get a tokenId (tokenidB)", async function () {
                tokenIdB = await mintNFT(privateKeyB);
                expect(tokenIdB).not.empty;
            });
            
            step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
                ).to.not.be.rejected;
                        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;

                ipIdB = response.ipId
            });            
        
            step("Wallet B can NOT register a derivative IP asset with licenseIdA and tokenIdB", async function () {                
                await expect(
                    linkIpToParent("B", [licenseIdA], ipIdB, waitForTransaction)
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: LicensingModule__LinkParentParamFailed()");
            });
        });
    });
});
