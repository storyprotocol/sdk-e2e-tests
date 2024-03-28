import { clientA, mintFeeTokenAddress, royaltyPolicyAddress } from '../../config/config'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai'
chai.use(chaiAsPromised);
import addContext = require("mochawesome/addContext");
import { captureConsoleLogs, writeToCSV } from '../../utils/utils'

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
                royaltyPolicy: royaltyPolicyAddress,
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

        it("Register a commercial policy without royaltyPolicy address", async function () {
            await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: true,
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.be.rejectedWith("Failed to register policy: The contract function \"registerPolicy\" reverted with the following signature:", "0x7660ada6");
        });

        it("Register a commercial policy with an invalid commercializerChecker address", async function () {
            const response = await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: true,
                    royaltyPolicy: royaltyPolicyAddress,
                    commercializerChecker: "0x16eF58e959522727588921A92e9084d36E5d3851",
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.be.rejectedWith("Failed to register policy: The contract function \"registerPolicy\" reverted.", 
                                 "Error: PolicyFrameworkManager__CommercializerCheckerDoesNotSupportHook(address commercializer)");
        });

        it("Register a commercial policy with an invalid commercialRevShare value", async function () {
            await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: true,
                    royaltyPolicy: royaltyPolicyAddress,
                    commercialRevShare: -1,
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.be.rejectedWith("Failed to register policy: Number \"-1\" is not in safe 256-bit unsigned integer range")
        });

        it("Register a commercial policy with commercializerCheckerData", async function () {
            const response = await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: true,
                    royaltyPolicy: royaltyPolicyAddress,
                    commercializerCheckerData: "0x48656c6c6f2c20776f726c6421",                    
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        it("Register a commercial policy with minting fee but no mintingFee token address", async function () {
            const response = await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: true,
                    royaltyPolicy: royaltyPolicyAddress,
                    mintingFee: "10",
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.be.rejectedWith("Failed to register policy: The contract function \"registerPolicy\" reverted.",
                                 "Error: LicensingModule__MintingFeeTokenNotWhitelisted()")
        });

        it("Register a commercial policy with an invalid mintingFeeToken address", async function () {
            const response = await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: true,
                    royaltyPolicy: royaltyPolicyAddress,
                    mintingFeeToken: "0x0000",
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.be.rejectedWith("Failed to register policy: Address \"0x0000\" is invalid.")
        });

        it("Register a commercial policy with invalid minting fee value", async function () {
            const response = await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: true,
                    royaltyPolicy: royaltyPolicyAddress,
                    mintingFee: "mintingFee",
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.be.rejectedWith("Failed to register policy: Cannot convert mintingFee to a BigInt")
        });

        it("Register a commercial policy with valid territories, distributionChannels and contentRestrictions parameters", async function () {
            const response = await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: true,
                    royaltyPolicy: royaltyPolicyAddress,
                    territories: ["US", "AU"],
                    distributionChannels: ["YouTube"],
                    contentRestrictions: ["Casino"],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        it("Register a commercial policy with the parameters territories, distributionChannels, contentRestrictions as special characters", async function () {
            const response = await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    commercialUse: true,
                    royaltyPolicy: royaltyPolicyAddress,
                    territories: ["!@#", "@#$"],
                    distributionChannels: ["***"],
                    contentRestrictions: ["`*&"],
                    txOptions: {
                        waitForTransaction: true
                    }
                })
            ).to.not.be.rejected
            
            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        it("Register a commercial policy with all parameters set", async function () {
            const response = await expect(
                clientA.policy.registerPILPolicy({
                    transferable: true,
                    attribution: true,
                    derivativesAllowed: true,
                    derivativesAttribution: true,
                    derivativesApproval: true,
                    derivativesReciprocal: true,
                    commercialUse: true,
                    commercialAttribution:true,
                    commercialRevShare: 300,
                    commercializerCheckerData: "0x48656c6c6f2c20776f726c6421",
                    royaltyPolicy: royaltyPolicyAddress,
                    mintingFee: "10",
                    mintingFeeToken: mintFeeTokenAddress,
                    territories: ["US", "AU", "UK", "CA", "FR"],
                    distributionChannels: ["Book", "Youtube", "Tiktok"],
                    contentRestrictions: ["Casino"],
                    txOptions: {
                        waitForTransaction: true
                    }
                })                
            ).not.to.be.rejected

            expect(response.policyId).to.be.a("string").and.not.empty;
        });

        after(function () {
            if (testResults.length > 0) {
                const csvFilename = "./test/policy/test-results-commicial.csv";
                const headers = Object.keys(testResults[0]);
                writeToCSV(csvFilename, headers, testResults);
            }
        });
    });
});