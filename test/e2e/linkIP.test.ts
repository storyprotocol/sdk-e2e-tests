import { privateKeyA, privateKeyB, accountA, accountB } from '../../config/config'
import { mintNFT, sleep } from '../../utils/utils'
import { registerRootIp, mintLicense, registerDerivativeIp, linkIpToParent } from '../../utils/sdkUtils'
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

describe('SDK E2E Test', function () {
    describe('Link an IP asset as a derivative to another IP asset', async function () {
        step("Mint a NFT to Wallet A", async function () {
            tokenIdA = await mintNFT(privateKeyA);
            expect(tokenIdA).not.empty

            await sleep(10)
        })

        step("Wallet A register a root IP Asset (IP1)", async function () {
            const response = await expect(
                registerRootIp("A", "1", tokenIdA, waitForTransaction)
            ).to.not.be.rejected

            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;

            ipIdA = response.ipId
            await sleep(10)
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

        step("Wallet B register a root IP Asset (IP2)", async function () {
            const response = await expect(
                registerRootIp("B", "1", tokenIdB, waitForTransaction)
            ).to.not.be.rejected

            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;

            ipIdB = response.ipId
            await sleep(10)
        });

        step("IP2 link to IP1 as it's derivative", async function () {
            const response = await expect(
                linkIpToParent("B", [licenseId], ipIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string");
            expect(response.txHash).not.empty;
            expect(response.ipId).to.be.a("string");
            expect(response.ipId).not.empty;
        })
    });
});