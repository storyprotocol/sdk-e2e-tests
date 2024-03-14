import { privateKeyA, privateKeyB, accountA, accountB } from '../../config/config'
import { mintNFT, sleep } from '../../utils/utils'
import { registerRootIp, registerPILPolicy, addPolicyToIp, mintLicense, registerDerivativeIp } from '../../utils/sdkUtils'
import { expect } from 'chai'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

let tokenIdA: any
let tokenIdB: any
let ipIdA: any
let policyId: any
let licenseId: any

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function () {
    describe('Register a derivative IP asset ', async function () {
        step("Mint a NFT to Wallet A", async function () {
            tokenIdA = await mintNFT(privateKeyA);
            expect(tokenIdA).not.empty

            await sleep(10)
        })

        step("Wallet A register a root IP Asset with policy id O", async function () {
            const response = await expect(
                registerRootIp("A", "0", tokenIdA, waitForTransaction)
            ).to.not.be.rejected

            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;

            ipIdA = response.ipId
            await sleep(10)
        });

        step("Create a policy with derivativesAllowed true", async function () {
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

            policyId = response.policyId
        });

        step("Add policy to the IP asset", async function () {
            const response = await expect(
                addPolicyToIp("A", ipIdA, policyId, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.index).to.be.a("string");
            expect(response.index).not.empty;
        });

        step("Wallet A mint a license with the receiverAddress set as Wallet B", async function () {
            const response = await expect(
                mintLicense("A", policyId, ipIdA, accountB.address, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.licenseId).to.be.a("string");
            expect(response.licenseId).not.empty;

            licenseId = response.licenseId
            await sleep(10)
        });

        step("Mint a NFT to WalletB", async function () {
            tokenIdB = await mintNFT(privateKeyB);
            expect(tokenIdB).not.empty
            await sleep(10)
        })

        step("Wallet B register a derivative IP asset", async function () {
            const response = await expect(
                registerDerivativeIp("B", [licenseId], tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;
        })
    });
});