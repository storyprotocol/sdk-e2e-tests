import { clientA } from '../config/config'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai'
chai.use(chaiAsPromised);
import addContext = require("mochawesome/addContext");
import {captureConsoleLogs} from '../utils/utils'

describe("SDK Test", function () {
    describe("Register PIL Social Remix Policy (policy.registerPILSocialRemixPolicy)", async function () {
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

        it("Register a PIL social remix policy with all parameters as empty array", async function () {
            const response = await expect(
                clientA.policy.registerPILSocialRemixPolicy({
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

        it("Register a PIL social remix policy with valid parameters", async function () {
            const response = await expect(
                clientA.policy.registerPILSocialRemixPolicy({
                    territories: ["US", "AU", "UK"],
                    distributionChannels: ["BOOK", "YouTube", "Tiktok"],
                    contentRestrictions: ["casino", "test"],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            console.log(JSON.stringify(response))
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        it("Register a PIL social remix policy with special characters in parameters", async function () {
            const response = await expect(
                clientA.policy.registerPILSocialRemixPolicy({
                    territories: ["ABC", "***"],
                    distributionChannels: ["!@#"],
                    contentRestrictions: ["#$%"],
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