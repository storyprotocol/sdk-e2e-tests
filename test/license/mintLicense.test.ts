import { accountA, accountB, nftContractAddress, privateKeyA, clientA, clientB, royaltyPolicyAddress} from '../../config/config';
import { registerRootIp, registerPILPolicy } from '../../utils/sdkUtils';
import { mintNFT, captureConsoleLogs, sleep } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import addContext = require("mochawesome/addContext");

let tokenIdA: any
let tokenIdB: any
let policyId1: any
let policyId2: any
let policyId3: any
let policyId4: any
let ipIdA: any

describe('SDK Test', function () {
    describe('Test license.mintLicense Function', async function () {
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

        before("Mint NFTs, Create Policies and Register IP Assets",async function () {
            tokenIdA = await mintNFT(privateKeyA);
            expect(tokenIdA).not.empty

            const policyOptions1 = {
                attribution: true,
                derivativesAllowed: false
            }

            const policyOptions2 = {
                attribution: true,
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesReciprocal: true
            }
    
            const policyOptions3 = {
                commercialUse: true,
                commercialRevShare: 100,
                royaltyPolicy: royaltyPolicyAddress
            }
    
            const policyOptions4 = {
                commercialUse: true,
                commercialRevShare: 100,
                derivativesAllowed: true,
                royaltyPolicy: royaltyPolicyAddress
            }
    
            policyId1 = (await registerPILPolicy("A", true, true, policyOptions1)).policyId;
            policyId2 = (await registerPILPolicy("A", true, true, policyOptions2)).policyId;
            policyId3 = (await registerPILPolicy("A", true, true, policyOptions3)).policyId;
            policyId4 = (await registerPILPolicy("A", true, true, policyOptions4)).policyId;

            ipIdA = (await registerRootIp("A", "0", nftContractAddress, tokenIdA, true)).ipId

            await sleep(20)
        });

        describe('Mint a license - Negative Tests', async function () {
            it("Mint a license with a non-existent policyId", async function () {
                await expect(
                    clientA.license.mintLicense({
                        policyId: "999999",
                        licensorIpId: ipIdA,
                        mintAmount: 2,
                        receiverAddress: accountB.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })       
                ).to.be.rejectedWith("Failed to mint license: The contract function \"mintLicense\" reverted.", 
                                     "Error: LicensingModule__PolicyNotFound()");
            });

            it("Mint a license with policyId:0", async function () {
                await expect(
                    clientA.license.mintLicense({
                        policyId: "0",
                        licensorIpId: ipIdA,
                        mintAmount: 2,
                        receiverAddress: accountB.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })   
                ).to.be.rejectedWith("Failed to mint license: The contract function \"mintLicense\" reverted.", 
                                     "Error: LicensingModule__PolicyNotFound()");
            });

            it("Mint a license with an invalid policyId", async function () {
                await expect(
                    clientA.license.mintLicense({
                        policyId: "policyId",
                        licensorIpId: ipIdA,
                        mintAmount: 2,
                        receiverAddress: accountB.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })    
                ).to.be.rejectedWith("Failed to mint license: Cannot convert policyId to a BigInt");
            });

            it("Mint a license with an invalid licensorIpId", async function () {
                await expect(
                    clientA.license.mintLicense({
                        policyId: policyId1,
                        licensorIpId: "0x00",
                        mintAmount: 2,
                        receiverAddress: accountB.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })       
                ).to.be.rejectedWith("Failed to mint license: Address \"0x00\" is invalid.");
            });

            it("Mint a license with a non-existent licensorIpId", async function () {
                await expect(
                    clientA.license.mintLicense({
                        policyId: policyId1,
                        licensorIpId: "0x0F994B6a1e0E9563502b7a21673EF9BF55692e66",
                        mintAmount: 2,
                        receiverAddress: accountB.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })       
                ).to.be.rejectedWith("Failed to mint license: The contract function \"mintLicense\" reverted.", 
                                     "Error: LicensingModule__LicensorNotRegistered()");
            });

            it("Mint a license with an invalid mintAmount value", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId1,
                        licensorIpId: ipIdA,
                        mintAmount: -1,
                        receiverAddress: accountB.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to mint license: Number \"-1n\" is not in safe 256-bit unsigned integer range");
            });

            it("Mint a license with mintAmount: 0", async function () {
                await expect(
                    clientA.license.mintLicense({
                        policyId: policyId1,
                        licensorIpId: ipIdA,
                        mintAmount: 0,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to mint license: The contract function \"mintLicense\" reverted with the following signature:", 
                                     "0x5c346611");
            });

            it("Mint a license with an invalid receiver address", async function () {
                await expect(
                    clientA.license.mintLicense({
                        policyId: policyId1,
                        licensorIpId: ipIdA,
                        mintAmount: 1,
                        receiverAddress: "0x00",
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to mint license: Address \"0x00\" is invalid.");
            });
        });

        describe('Mint a license - IP Asset without policy', async function () {
            let licenseId1: any
            let licenseId2: any
            it("The owner can mint a license with non-commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId1,
                        licensorIpId: ipIdA,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
                licenseId1 = response.licenseId;          
            });
                
            it("The owner can mint a license with commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId3,
                        licensorIpId: ipIdA,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
                licenseId2 = response.licenseId;
            });

            it("The owner mint a license with same non-commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId1,
                        licensorIpId: ipIdA,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.equal(licenseId1);          
            });

            it("The owner mint a license with different non-commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId2,
                        licensorIpId: ipIdA,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
                expect(response.licenseId).not.to.equal(licenseId1);           
            });

            it("The owner mint a license with same commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId3,
                        licensorIpId: ipIdA,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.equal(licenseId2);          
            });

            it("The owner mint a license with different commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId2,
                        licensorIpId: ipIdA,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
                expect(response.licenseId).not.to.equal(licenseId2);           
            });

            it("Non-owner can NOT mint a license", async function () {
                const response = await expect(
                    clientB.license.mintLicense({
                        policyId: policyId2,
                        licensorIpId: ipIdA,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to mint license: The contract function \"mintLicense\" reverted.",
                                     "Error: LicensingModule__CallerNotLicensorAndPolicyNotSet()")
            });
        });

        describe('Mint a license - IP Asset with a non-commercial policy', async function () {
            let ipId1: any
            let ipId2: any
            before("Mint NFTs, Create Policies and Register IPs",async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdB).not.empty

                tokenIdB = await mintNFT(privateKeyA);
                expect(tokenIdB).not.empty
                ipId1 = (await registerRootIp("A", policyId1, nftContractAddress, tokenIdA, true)).ipId
                ipId2 = (await registerRootIp("A", policyId2, nftContractAddress, tokenIdB, true)).ipId
                await sleep(20)
            });

            it("The owner can mint a license with the same non-commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId1,
                        licensorIpId: ipId1,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
            });

            it("The owner can mint a license with a different non-commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId1,
                        licensorIpId: ipId2,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
            });

            it("The owner can mint a license with a commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId3,
                        licensorIpId: ipId1,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
            });

            it("Non-owner can NOT mint a license", async function () {
                const response = await expect(
                    clientB.license.mintLicense({
                        policyId: policyId2,
                        licensorIpId: ipId1,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to mint license: The contract function \"mintLicense\" reverted.",
                                     "Error: LicensingModule__CallerNotLicensorAndPolicyNotSet()")
            });
        });

        describe('Mint a license - IP Asset with a commercial policy', async function () {
            let ipId1: any
            let ipId2: any
            before("Mint NFTs, Create Policies and Register IPs",async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty                
                tokenIdB = await mintNFT(privateKeyA);
                expect(tokenIdB).not.empty

                ipId1 = (await registerRootIp("A", policyId3, nftContractAddress, tokenIdA, true)).ipId
                ipId2 = (await registerRootIp("A", policyId4, nftContractAddress, tokenIdB, true)).ipId
                await sleep(20)
            });

            it("The owner can mint a license with the same commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId3,
                        licensorIpId: ipId1,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
            });

            it("The owner can mint a license with a different commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId3,
                        licensorIpId: ipId2,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
            });

            it("The owner can mint a license with a non-commercial policy", async function () {
                const response = await expect(
                    clientA.license.mintLicense({
                        policyId: policyId1,
                        licensorIpId: ipId1,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.not.be.rejected
                console.log(JSON.stringify(response))
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
            });

            it("Non-owner can NOT mint a license", async function () {
                const response = await expect(
                    clientB.license.mintLicense({
                        policyId: policyId4,
                        licensorIpId: ipId1,
                        mintAmount: 1,
                        receiverAddress: accountA.address,
                        txOptions: {
                            waitForTransaction: true,
                        }
                    })
                ).to.be.rejectedWith("Failed to mint license: The contract function \"mintLicense\" reverted.",
                                         "Error: LicensingModule__CallerNotLicensorAndPolicyNotSet()")
            });
        });
    });
});