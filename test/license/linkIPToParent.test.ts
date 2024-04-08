import { accountB, privateKeyA, privateKeyB, privateKeyC, clientA, clientB,clientC, royaltyPolicyAddress, nftContractAddress, accountC} from '../../config/config';
import { registerRootIp, registerPILPolicy, mintLicense } from '../../utils/sdkUtils';
import { mintNFT, captureConsoleLogs, sleep } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import addContext = require("mochawesome/addContext");

let tokenIdA: any
let tokenIdB: any
let tokenIdC: any
let policyId1: any
let policyId2: any
let policyId3: any
let ipIdTest: any
let ipIdA: any
let ipIdB: any
let ipIdC: any
let licenseId1: any
let licenseId2: any
let licenseId3: any

describe('SDK Test', function () {
    describe('Test license.linkIpToParent Function', async function () {
        let consoleLogs: string[] = [];

        // To print test results in test report
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

        before("Mint NFTs, Create Policies and Register IP Assets, Mint License",async function () {
            tokenIdA = await mintNFT(privateKeyA);
            expect(tokenIdA).not.empty

            tokenIdB = await mintNFT(privateKeyB);
            expect(tokenIdB).not.empty

            tokenIdC = await mintNFT(privateKeyC);
            expect(tokenIdC).not.empty

            const policyOptions1 = {
                derivativesAllowed: true
            }
    
            const policyOptions2 = {
                commercialUse: true,
                commercialRevShare: 100,
                derivativesAllowed: true,
                royaltyPolicy: royaltyPolicyAddress
            }

            const policyOptions3 = {
                derivativesAllowed: true,
                attribution: true
            }
    
            policyId1 = (await registerPILPolicy("A", true, true, policyOptions1)).policyId;
            policyId2 = (await registerPILPolicy("A", true, true, policyOptions2)).policyId;
            policyId3 = (await registerPILPolicy("A", true, true, policyOptions3)).policyId;

            ipIdA = (await registerRootIp("A", "1", nftContractAddress, tokenIdA, true)).ipId
            ipIdB = (await registerRootIp("B", "1", nftContractAddress, tokenIdB, true)).ipId
            ipIdC = (await registerRootIp("C", "1", nftContractAddress, tokenIdC, true)).ipId
            await sleep(20)

            licenseId1 = (await mintLicense("A", policyId1, ipIdA, 2, accountB.address, true)).licenseId
            licenseId2 = (await mintLicense("A", policyId2, ipIdA, 2, accountC.address, true)).licenseId
            licenseId3 = (await mintLicense("A", policyId3, ipIdA, 2, accountB.address, true)).licenseId
            await sleep(20)
        });

        describe('Link Ip to Parent - Negative Tests', async function () {
            it("Link Ip to Parent with an invalid licenseId", async function () {
                const response = await expect(
                    clientA.license.linkIpToParent({
                        licenseIds: ["licenseId1"],
                        childIpId: ipIdA,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    }) 
                ).to.be.rejectedWith("Failed to link IP to parents: Cannot convert licenseId1 to a BigInt"); 
            });

            it("Link Ip to Parent with a non-existent licenseId", async function () {
                const response = await expect(
                    clientA.license.linkIpToParent({
                        licenseIds: ["99999999"],
                        childIpId: ipIdA,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to link IP to parents: Cannot read properties of null (reading 'licensorIpId')"); 
            });

            it("Link Ip to Parent with an empty IP id", async function () {
                const response = await expect(
                    clientA.license.linkIpToParent({
                        licenseIds: [licenseId1],
                        childIpId: ipIdTest,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to link IP to parents: Address \"undefined\" is invalid."); 
            });

            it("Link Ip to Parent with an invalid IP id", async function () {
                const response = await expect(
                    clientA.license.linkIpToParent({
                        licenseIds: [licenseId1],
                        childIpId: "0x0000",
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to link IP to parents: Address \"0x0000\" is invalid."); 
            });

            it("Link Ip to Parent with a non-existent IP id", async function () {
                const response = await expect(
                    clientA.license.linkIpToParent({
                        licenseIds: [licenseId1],
                        childIpId: "0xAF04ef332BA1A5B9d3E7cdB1100F069031fD4480",
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" returned no data (\"0x\")."); 
            });

            it("Non-owner try to link IP to parent", async function () {
                const response = await expect(
                    clientB.license.linkIpToParent({
                        licenseIds: [licenseId1],
                        childIpId: ipIdA,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: AccessController__PermissionDenied"); 
            });

            it("Link Ip to Parent with parentId equals childId", async function () {
                const response = await expect(
                    clientA.license.linkIpToParent({
                        licenseIds: [licenseId2],
                        childIpId: ipIdA,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: LicensingModule__ParentIdEqualThanChild()");
            });            

            it("Link Ip to Parent with multiple incompatible licenses", async function () {
                const response = await expect(
                    clientB.license.linkIpToParent({
                        licenseIds: [licenseId1, licenseId2],
                        childIpId: ipIdB,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: LicensingModule__IncompatibleLicensorCommercialPolicy()");
            });            

            it("Link Ip to Parent by a not licensee", async function () {
                const response = await expect(
                    clientC.license.linkIpToParent({
                        licenseIds: [licenseId1],
                        childIpId: ipIdC,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to link IP to parents: The contract function \"execute\" reverted.", 
                                     "Error: LicensingModule__NotLicensee()");
            });
        });

        describe('Link Ip to Parent', async function () {            
            it("Link Ip to Parent with an empty licenseIds array", async function () {
                const response = await expect(
                    clientB.license.linkIpToParent({
                        licenseIds: [],
                        childIpId: ipIdB,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true; 
            });

            it("Link Ip to Parent with a license linked non-commericial policy", async function () {
                const response = await expect(
                    clientB.license.linkIpToParent({
                        licenseIds: [licenseId1],
                        childIpId: ipIdB,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true; 
            });

            it("Link Ip to Parent with multiple licenses", async function () {
                const response = await expect(
                    clientB.license.linkIpToParent({
                        licenseIds: [licenseId1, licenseId3],
                        childIpId: ipIdB,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true; 
            });

            it("Link Ip to Parent with a license linked commericial policy", async function () {
                const response = await expect(
                    clientC.license.linkIpToParent({
                        licenseIds: [licenseId2],
                        childIpId: ipIdC,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true; 
            });
        })
    });
});