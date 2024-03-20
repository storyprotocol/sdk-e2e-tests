import { privateKeyA, privateKeyB, accountA, accountB, accountC } from '../../config/config'
import { mintNFT, sleep } from '../../utils/utils'
import { registerRootIp, mintLicense, registerDerivativeIp, linkIpToParent, setPermission } from '../../utils/sdkUtils'
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

describe('Set Permission', async function () {
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

    step("Set permission for Wallet B", async function () {
        const response = await expect(
            setPermission("A", ipIdA, accountA.address, accountB.address, "0x00000000", 1, waitForTransaction)
        ).to.not.be.rejected;

        expect(response.txHash).to.be.a("string");
        expect(response.txHash).not.empty;
        expect(response.success).to.be.true

        await sleep(10)
    });

    step("Mint a NFT to WalletB", async function () {
        tokenIdB = await mintNFT(privateKeyB);
        expect(tokenIdB).not.empty
        await sleep(10)
    })

    step("Wallet B mint a license", async function () {
        const response = await expect(
            mintLicense("B", "1", ipIdA, accountC.address, waitForTransaction)
        ).to.not.be.rejected;

        expect(response.txHash).to.be.a("string");
        expect(response.txHash).not.empty;
        expect(response.licenseId).to.be.a("string");
        expect(response.licenseId).not.empty;

        licenseId = response.licenseId
        await sleep(10)
    });
});