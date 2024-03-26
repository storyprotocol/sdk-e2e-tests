import { accountA, clientA } from '../../config/config'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai'
chai.use(chaiAsPromised);
import addContext = require("mochawesome/addContext");
import { beforeEach } from 'mocha';
import { Address } from 'viem';
import { captureConsoleLogs, writeToCSV} from '../../utils/utils'

const testResults: any[] = [];
let response: any;

describe("SDK Test", function () {
    describe("Register Commercial Policies (policy.registerPILPolicy)", async function () {
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
            "derivativesReciprocal",
            "commercialAttribution"
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
                commercialUse: true,
                // commercialRevShare: 100,
                // mintingFee: 0,
                // mintingFeeToken: "0x857308523a01B430cB112400976B9FC4A6429D55" as Address,
                royaltyPolicy: "0x16eF58e959522727588921A92e9084d36E5d3855" as Address,
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
        after(function () {
            if (testResults.length > 0) {
                const csvFilename = "./test/policy/test-results-commicial.csv";
                const headers = Object.keys(testResults[0]);
                writeToCSV(csvFilename, headers, testResults);
            }
        });
    });    
});