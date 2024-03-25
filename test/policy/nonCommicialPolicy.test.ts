import { clientA } from '../../config/config'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai'
chai.use(chaiAsPromised);
import addContext = require("mochawesome/addContext");
import { writeToCSV } from '../../utils/utils'

const testResults: any[] = [];

describe("SDK Test", function () {
    describe("Register Non-Commercial Policies", async function () {
        let consoleLogs: string[] = [];

        beforeEach(function () {
            consoleLogs = [];
            const originalConsoleLog = console.log;
            console.log = function (...args: any[]) {
                consoleLogs.push(args.join(' '));
                originalConsoleLog.apply(console, args);
            };
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
                const response = await clientA.policy.registerPILPolicy({
                    ...policyOptions,
                    txOptions: {
                        waitForTransaction: true
                    }
                });
                console.log(JSON.stringify(response))

                expect(response.policyId).to.be.a("string");
                expect(response.policyId).not.empty;

                const policyOptionsKeyValue: { [key: string]: string } = {};

                Object.entries(policyOptions).forEach(([key, value]) => {
                    policyOptionsKeyValue[key] = String(value);
                });

                testResults.push({ ...policyOptionsKeyValue, policyId: response && response.policyId ? `${response.policyId}` : "" });
            });
        };
        after(function () {
            if (testResults.length > 0) {
                const csvFilename = "./test/policy/test-results-noncommicial.csv";
                const headers = Object.keys(testResults[0]);
                writeToCSV(csvFilename, headers, testResults);
            }
        });
    });
});