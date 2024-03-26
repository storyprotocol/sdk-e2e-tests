import { clientA } from '../../config/config'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai'
chai.use(chaiAsPromised);
import addContext = require("mochawesome/addContext");
import { captureConsoleLogs } from '../../utils/utils'

describe("SDK Test", function () {
    describe("Register PIL Commercial Use Policy (policy.registerPILCommercialUsePolicy)", async function () {
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

        it("Register a PIL commercial use policy with the parameter commercialRevShare 0", async function () {
            const response = await expect(
                clientA.policy.registerPILCommercialUsePolicy({
                    commercialRevShare: 100,
                    territories: [],
                    distributionChannels: [],
                    contentRestrictions: [],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            console.log(JSON.stringify(response))
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        it("Register a PIL commercial use policy with the parameter commercialRevShare 100%", async function () {
            const response = await expect(
                clientA.policy.registerPILCommercialUsePolicy({
                    commercialRevShare: 1000,
                    territories: [],
                    distributionChannels: [],
                    contentRestrictions: [],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            console.log(JSON.stringify(response))
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        it("Register a PIL commercial use policy with the parameter commercialRevShare > 100%", async function () {
            const response = await expect(
                clientA.policy.registerPILCommercialUsePolicy({
                    commercialRevShare: 1001,
                    territories: [],
                    distributionChannels: [],
                    contentRestrictions: [],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            console.log(JSON.stringify(response))
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        it("Register a PIL commercial use policy with mintingFee 0", async function () {
            const response = await expect(
                clientA.policy.registerPILCommercialUsePolicy({
                    commercialRevShare: 100,
                    mintingFee: "0",
                    territories: [],
                    distributionChannels: [],
                    contentRestrictions: [],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            console.log(JSON.stringify(response))
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        it("Register a PIL commercial use policy with invalid mintingFee", async function () {
            await expect(
                clientA.policy.registerPILCommercialUsePolicy({
                    commercialRevShare: 100,
                    mintingFee: "minting fee",
                    territories: [],
                    distributionChannels: [],
                    contentRestrictions: [],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.be.rejectedWith("Failed to register commercial use policy: Cannot convert minting fee to a BigInt")
        });

        it("Register a PIL commercial use policy with invalid mintingFeeToken", async function () {
            await expect(
                clientA.policy.registerPILCommercialUsePolicy({
                    commercialRevShare: 100,
                    mintingFee: "0",
                    mintingFeeToken: "0x0",
                    territories: [],
                    distributionChannels: [],
                    contentRestrictions: [],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.be.rejectedWith("Failed to register commercial use policy: Address \"0x0\" is invalid.")
        });

        it("Register a PIL commercial use policy with non-existent mintingFeeToken", async function () {
            await expect(
                clientA.policy.registerPILCommercialUsePolicy({
                    commercialRevShare: 100,
                    mintingFee: "0",
                    mintingFeeToken: "0xA6B8193b10D7882B8E392d5FDC265C6397dad12",
                    territories: [],
                    distributionChannels: [],
                    contentRestrictions: [],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.be.rejectedWith("Failed to register commercial use policy: Address \"0xA6B8193b10D7882B8E392d5FDC265C6397dad12\" is invalid")
        });

        it("Register a PIL commercial use policy with parameters territories, distributionChannels, contentRestrictions as empty array", async function () {
            const response = await expect(
                clientA.policy.registerPILCommercialUsePolicy({
                    commercialRevShare: 100,
                    mintingFee: "0",
                    mintingFeeToken: "0x857308523a01B430cB112400976B9FC4A6429D55",
                    territories: [],
                    distributionChannels: [],
                    contentRestrictions: [],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            console.log(JSON.stringify(response))
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        it("Register a PIL commercial use policy with valid parameters territories, distributionChannels, contentRestrictions", async function () {
            const response = await expect(
                clientA.policy.registerPILCommercialUsePolicy({
                    commercialRevShare: 100,
                    mintingFee: "0",
                    mintingFeeToken: "0x857308523a01B430cB112400976B9FC4A6429D55",
                    territories: ["US", "AU"],
                    distributionChannels: ["Book", "Youtube"],
                    contentRestrictions: ["casino"],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            console.log(JSON.stringify(response))
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        it("Register a PIL commercial use policy with parameters territories, distributionChannels, contentRestrictions as special characters", async function () {
            const response = await expect(
                clientA.policy.registerPILCommercialUsePolicy({
                    commercialRevShare: 100,
                    mintingFee: "0",
                    mintingFeeToken: "0x857308523a01B430cB112400976B9FC4A6429D55",
                    territories: ["***", "$%^"],
                    distributionChannels: ["!@#", "$#@"],
                    contentRestrictions: ["&*%"],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            console.log(JSON.stringify(response))
            expect(response.policyId).to.be.a("string").and.not.empty;
        });
    });
});