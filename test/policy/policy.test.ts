import { privateKeyA, privateKeyB, accountA, accountB } from '../../config/config'
import { mintNFT, sleep } from '../../utils/utils'
import { registerPILPolicy } from '../../utils/sdkUtils'
import { expect } from 'chai'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

let tokenIdA: any
let tokenIdB: any
let ipIdA: any
let ipIdB: any
let policyId: any
let licenseId: any

const waitForTransaction: boolean = true;

describe('SDK Test', function () {
    describe('Test Policy Function', async function () {
        it("Create a policy with derivativesAllowed true", async function () {
            const policyOptions = {
                attribution: true,
                derivativesAllowed: true,
                derivativesAttribution: true,
                derivativesReciprocal: true
            }
            const response = await expect(
                registerPILPolicy("A", true, waitForTransaction, policyOptions)
            ).to.not.be.rejected;

            expect(response.policyId).to.be.a("string");
            expect(response.policyId).not.empty;
        });

        it("Create a policy with all parameters false", async function () {
            const response = await expect(
                registerPILPolicy("A", false, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.policyId).to.be.a("string");
            expect(response.policyId).not.empty;
        });
    });
});