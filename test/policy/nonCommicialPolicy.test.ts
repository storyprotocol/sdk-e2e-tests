import { clientA } from '../../config/config'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai'
chai.use(chaiAsPromised);
import addContext = require("mochawesome/addContext");
import { captureConsoleLogs, writeToCSV } from '../../utils/utils'

const testResults: any[] = [];
let response: any;

describe("SDK Test", function () {
    describe("Register Non-Commercial Policies (policy.registerPILPolicy)", async function () {
        let consoleLogs: string[] = [];

        beforeEach(function () {
            consoleLogs = captureConsoleLogs(consoleLogs)
        });

        afterEach(function () {
            if (consoleLogs.length > 0) {
                addContext(this, {
                    title: 'Test Result',
                    value: consoleLogs[consoleLogs.length - 1]
                });
            }
        });

        const parameters = [
            "transferable",
            "attribution",
            "derivativesAllowed",
            "derivativesAttribution",
            "derivativesApproval",
            "derivativesReciprocal"
        ];

        const combinations = [];

        for (let i = 0; i < Math.pow(2, parameters.length); i++) {
            const combination: Record<string, boolean> = {};

            for (let j = 0; j < parameters.length; j++) {
                combination[parameters[j]] = (i >> j) % 2 === 0 ? false : true;
            }

            combinations.push(combination);
        }

        for (const combination of combinations) {
            let policyOptions: any

            policyOptions = {
                ...combination,
                commercialUse: false,
                territories: [],
                distributionChannels: [],
                contentRestrictions: []
            }

            it("Create a policy with parameters" + JSON.stringify(policyOptions), async function () {
                // derivativesAllowed is false, and one or more other derivatives-related parameters are true, the registration process fails.
                if (!policyOptions.derivativesAllowed && (policyOptions.derivativesAttribution ||
                    policyOptions.derivativesApproval || policyOptions.derivativesReciprocal)) {
                    response = await expect(
                        clientA.policy.registerPILPolicy({
                            ...policyOptions,
                            txOptions: {
                                waitForTransaction: true
                            }
                        })
                    ).to.be.rejectedWith("Failed to register policy: The contract function \"registerPolicy\" reverted with the following signature:", "0x550c4952")
                } else {
                    response = await expect(
                        clientA.policy.registerPILPolicy({
                            ...policyOptions,
                            txOptions: {
                                waitForTransaction: true
                            }
                        })
                    ).to.not.be.rejected
                    expect(response.policyId).to.be.a("string").and.not.empty;
                }
                console.log(JSON.stringify(response))

                const policyOptionsKeyValue: { [key: string]: string } = {};
                Object.entries(policyOptions).forEach(([key, value]) => {
                    policyOptionsKeyValue[key] = String(value);
                });

                testResults.push({ ...policyOptionsKeyValue, policyId: response && response.policyId ? `${response.policyId}` : "" });
            });
        };

        it("Register a Non-Commercial Policies with the parameters territories, distributionChannels, contentRestrictions as empty array", async function () {
            const response = await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: false,
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

        it("Register a Non-Commercial Policies with valid parameters territories, distributionChannels, contentRestrictions", async function () {
            const response = await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: false,
                    territories: ["US", "AU"],
                    distributionChannels: ["TV"],
                    contentRestrictions: ["Casino"],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            console.log(JSON.stringify(response))
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        it("Register a Non-Commercial Policies with the parameters territories, distributionChannels, contentRestrictions as special characters", async function () {
            const response = await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: false,
                    territories: ["Test", "***"],
                    distributionChannels: ["!@#"],
                    contentRestrictions: ["$%^@"],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            console.log(JSON.stringify(response))
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        after(function () {
            if (testResults.length > 0) {
                const csvFilename = "./test/policy/test-results-noncommicial.csv";
                const headers = Object.keys(testResults[0]);
                writeToCSV(csvFilename, headers, testResults);
            }
        });
    });
});