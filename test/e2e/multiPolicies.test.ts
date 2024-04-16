import { privateKeyA, accountB, privateKeyB, nftContractAddress, royaltyPolicyAddress } from '../../config/config'
import { mintNFT, captureConsoleLogs } from '../../utils/utils'
import { registerIpAsset, mintLicense, registerPILPolicy, addPolicyToIp, linkIpToParent } from '../../utils/sdkUtils'
import { expect } from 'chai'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import addContext = require("mochawesome/addContext");

let tokenIdA: any
let tokenIdB: any
let ipIdA: any 
let ipIdB: any 
let policyId1: any
let policyId2: any
let policyId3: any
let policyId4: any
let licenseIdA: any
let licenseIdB: any

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function () {
    describe("Multiple Policies", async function () {
        describe("Register a root IP asset and add multiple policies", async function () {
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

            before(async function () {
                const policyOptions1 = {
                    attribution: true, 
                    derivativesAllowed: true, 
                    derivativesAttribution: true, 
                    derivativesReciprocal: true
                };

                const policyOptions2 ={
                    attribution: true, 
                    derivativesAllowed: false
                }

                const policyOptions3 = {
                    attribution: true, 
                    derivativesAllowed: true, 
                    derivativesAttribution: true, 
                    derivativesReciprocal: false
                }

                const policyOptions4 = {
                    royaltyPolicy: royaltyPolicyAddress,
                    commercialRevShare: 300,
                    attribution: true,
                    commercialUse: true,
                    commercialAttribution: true,
                    derivativesAllowed: true,
                    derivativesReciprocal: true
                }

                policyId1 = (await registerPILPolicy("A", true, waitForTransaction, policyOptions1)).policyId;
                policyId2 = (await registerPILPolicy("A", true, waitForTransaction, policyOptions2)).policyId;
                policyId3 = (await registerPILPolicy("A", true, waitForTransaction, policyOptions3)).policyId;
                policyId4 = (await registerPILPolicy("A", true, waitForTransaction, policyOptions4)).policyId;
            });

            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty
            });

            step("Wallet A register a root IP Asset with policyId1, get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;

                ipIdA = response.ipId
            });

            step("Add policy (policyId2) to the IP asset (ipIdA)", async function () {
                const response = await expect(
                    addPolicyToIp("A", ipIdA, policyId2, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.index).to.be.a("string").and.not.empty;
            });

            step("Wallet A can mint a license with policyId1 and ipIdA, get a licenseId (licenseIdA)", async function () {
                const response = await expect(
                    mintLicense("A", policyId1, ipIdA, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;

                licenseIdA = response.licenseId
            });

            step("Wallet B can mint a license with policyId2 and ipIdA, get a licenseId (licenseIdB)", async function () {
                const response = await expect(
                    mintLicense("B", policyId2, ipIdA, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;

                licenseIdB = response.licenseId
            });

            step("Wallet A can mint a license with policyId3 and ipIdA", async function () {
                const response = await expect(
                    mintLicense("A", policyId3, ipIdA, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
                                
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
            });

            step("Wallet A can mint a license with policyId4 and ipIdA", async function () {
                const response = await expect(
                    mintLicense("A", policyId4, ipIdA, 2, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
                                
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
            });

            step("Wallet B can NOT mint a license with commercial policy (policyId4) and ipIdA", async function () {
                const response = await expect(
                    mintLicense("B", policyId4, ipIdA, 2, accountB.address, waitForTransaction)
                ).to.be.rejectedWith("Failed to mint license: The contract function \"mintLicense\" reverted.",
                                     "Error: LicensingModule__CallerNotLicensorAndPolicyNotSet()")
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

            // licenseIdA with policyId1 (derivativesAllowed: true) and licenseIdB with policyId2 (derivativesAllowed: false) are conflicting
            step("Wallet B can NOT register a derivative IP asset with licenseIdA and licenseIdB as policy conflicts", async function () {
                const response = await expect(
                    linkIpToParent("B", [licenseIdA, licenseIdB], ipIdB, waitForTransaction)
                ).to.be.rejectedWith("Failed to register derivative IP: The contract function \"registerDerivativeIp\" reverted.",
                                     "Error: LicensingModule__LinkParentParamFailed()");
            });
        });
    });
});