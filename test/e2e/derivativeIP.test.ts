import { privateKeyA, privateKeyB, accountB, privateKeyC, accountC } from '../../config/config'
import { mintNFT, sleep } from '../../utils/utils'
import { registerRootIp, registerPILPolicy, addPolicyToIp, mintLicense, registerDerivativeIp } from '../../utils/sdkUtils'
import { expect } from 'chai'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

let tokenIdA: any
let tokenIdB: any
let tokenIdC: any
let ipIdA: any
let ipIdB: any
let policyId1: any
let policyId2: any
let licenseIdA: any
let licenseIdB: any

const waitForTransaction: boolean = true;

describe("Derivative IP asset", function(){
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
    })

    describe.skip("Register a derivative IP asset, root IP\'s policy allows derivatives (derivativesAllowed: true)", async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFT(privateKeyA);
            expect(tokenIdA).not.empty    
        })
    
        step("Wallet A register a root IP Asset with tokenIdA and policy id O, get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerRootIp("A", "0", tokenIdA, waitForTransaction)
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
                mintLicense("A", policyId1, ipIdA, accountB.address, waitForTransaction)
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
        })
    
        step("Wallet B can register a derivative IP asset with licenseIdA and tokenIdB", async function () {
            const response = await expect(
                registerDerivativeIp("B", [licenseIdA], tokenIdB, waitForTransaction)
            ).to.not.be.rejected;
    
            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;
        })
    
        step("Mint a NFT to WalletC and get a tokenId(tokenIdC)", async function () {
            tokenIdC = await mintNFT(privateKeyC);
            expect(tokenIdC).not.empty
            await sleep(10)
        })
    
        step("Wallet C can NOT register a derivative IP asset with licenseIdA and tokenIdC", async function () {
            const response = await expect(
                registerDerivativeIp("C", [licenseIdA], tokenIdC, waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative IP: The contract function \"registerDerivativeIp\" reverted.", 
                                 "Error: LicensingModule__NotLicensee()");
        })
    });
    
    describe.skip('Register a derivative IP asset, root IP\'s policy allows derivatives (derivativesAllowed: false)', async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFT(privateKeyA);
            expect(tokenIdA).not.empty
    
        })
    
        step("Wallet A register a root IP Asset with tokenIdA and policyId2, get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerRootIp("A", policyId2, tokenIdA, waitForTransaction)
            ).to.not.be.rejected
    
            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;
    
            ipIdA = response.ipId
        });
    
        step("Wallet A mint a license with the receiverAddress set as Wallet B, get a licenseId (licenseIdA)", async function () {
            const response = await expect(
                mintLicense("A", policyId2, ipIdA, accountB.address, waitForTransaction)
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
        })
    
        step("Wallet B can NOT register a derivative IP asset with licenseIdA and tokenIdB", async function () {
            const response = await expect(
                registerDerivativeIp("B", [licenseIdA], tokenIdB, waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative IP: The contract function \"registerDerivativeIp\" reverted.", 
                                 "Error: LicensingModule__LinkParentParamFailed()");
        })
    });

    describe('Register a derivative IP asset with multiple license ids', async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFT(privateKeyA);
            expect(tokenIdA).not.empty    
        })
    
        step("Wallet A register a root IP Asset with tokenIdA and policyId1, get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerRootIp("A", policyId1, tokenIdA, waitForTransaction)
            ).to.not.be.rejected

            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;
    
            ipIdA = response.ipId
        });
    
        step("Wallet A mint a license with the receiverAddress set as Wallet C, get a licenseId (licenseIdA)", async function () {
            const response = await expect(
                mintLicense("A", policyId1, ipIdA, accountC.address, waitForTransaction)
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
        })

        step("Wallet B register a root IP Asset with tokenIdB and policyId1, get an ipId (ipIdB)", async function () {
            const response = await expect(
                registerRootIp("B", policyId1, tokenIdB, waitForTransaction)
            ).to.not.be.rejected
    
            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;
    
            ipIdB = response.ipId
        });
    
        step("Wallet B mint a license with the receiverAddress set as Wallet C, get a licenseId (licenseIdB)", async function () {
            const response = await expect(
                mintLicense("B", policyId1, ipIdB, accountC.address, waitForTransaction)
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
        })        
    
        step("Wallet C can register a derivative IP asset with licenseIdA, licenseIdB and tokenIdC", async function () {
            const response = await expect(
                registerDerivativeIp("C", [licenseIdA, licenseIdB], tokenIdC, waitForTransaction)
            ).to.not.be.rejected;
    
            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;
        })
    });
})