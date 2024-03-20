import { privateKeyA, privateKeyB, accountB } from '../../config/config'
import { mintNFT } from '../../utils/utils'
import { registerRootIp, mintLicense, linkIpToParent } from '../../utils/sdkUtils'
import { expect } from 'chai'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

let tokenIdA: any
let tokenIdB: any
let ipIdA: any
let ipIdB: any
let licenseId: any

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function () {
    describe("Link IP to Parent IP Asset", async function () {
        describe("Link an IP asset to another IP asset as it's derivative", async function () {
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty
            });
        
            step("Wallet A register a root IP Asset with tokenIdA, the an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerRootIp("A", "1", tokenIdA, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdA = response.ipId
            });
        
            step("Wallet A mint a license with ipIdA and get a licenseId", async function () {
                const response = await expect(
                    mintLicense("A", "1", ipIdA, accountB.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.licenseId).to.be.a("string");
                expect(response.licenseId).not.empty;
        
                licenseId = response.licenseId
            });
        
            step("Mint a NFT to WalletB and get a tokenId (tokenIdB)", async function () {
                tokenIdB = await mintNFT(privateKeyB);
                expect(tokenIdB).not.empty
            });
        
            step("Wallet B register a root IP Asset with tokenIdB, get an ipId (ipIdB)", async function () {
                const response = await expect(
                    registerRootIp("B", "1", tokenIdB, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
        
                ipIdB = response.ipId
            });
        
            step("ipIdB can link to ipIdA as it's derivative IP Asset", async function () {
                const response = await expect(
                    linkIpToParent("B", [licenseId], ipIdB, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string");
                expect(response.txHash).not.empty;
                expect(response.ipId).to.be.a("string");
                expect(response.ipId).not.empty;
            });
        });   
    });
});