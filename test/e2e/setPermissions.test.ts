import { privateKeyA, accountB, accountA, licenseModuleAddress, nftContractAddress} from '../../config/config'
import { mintNFT, captureConsoleLogs } from '../../utils/utils'
import { registerRootIp, mintLicense, setPermission } from '../../utils/sdkUtils'
import { expect } from 'chai'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import addContext = require("mochawesome/addContext");

let tokenIdA: any
let ipIdA: any

const waitForTransaction: boolean = true;

describe('SDK E2E Test', function () {
    describe("Set Permissions Functions", async function () {
        // To print test results in test report
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

        describe("Set permission - 1 ALLOW", async function (){
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty
            });
        
            step("Wallet A register a root IP Asset without policy, get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerRootIp("A", "0", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty
        
                ipIdA = response.ipId
            });
        
            step("Wallet A set permission to allow Wallet B to call license Module", async function () {
                const response = await expect(
                    setPermission("A", ipIdA, accountB.address, licenseModuleAddress, 1, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true
            });
        
            step("Wallet B can mint a license with ipIdA", async function () {
                const response = await expect(
                    mintLicense("B", "1", ipIdA, 2, accountA.address, waitForTransaction)
                ).to.not.be.rejected;
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.licenseId).to.be.a("string").and.not.empty;
            });
        });
        
        describe("Set permission - 2 DENY", async function (){
            step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
                tokenIdA = await mintNFT(privateKeyA);
                expect(tokenIdA).not.empty
            });
        
            step("Wallet A register a root IP Asset without policy, get an ipId (ipIdA)", async function () {
                const response = await expect(
                    registerRootIp("A", "0", nftContractAddress, tokenIdA, waitForTransaction)
                ).to.not.be.rejected
        
                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.ipId).to.be.a("string").and.not.empty;
        
                ipIdA = response.ipId
            });
        
            step("Wallet A set permission to NOT allow Wallet B to call license Module", async function () {
                const response = await expect(
                    setPermission("A", ipIdA, accountB.address, licenseModuleAddress, 2, waitForTransaction)
                ).to.not.be.rejected;

                expect(response.txHash).to.be.a("string").and.not.empty;
                expect(response.success).to.be.true
            });
            
            step("Wallet B can NOT mint a license with ipIdA", async function () {
                const response = await expect(
                    mintLicense("B", "1", ipIdA, 1, accountA.address, waitForTransaction)
                ).to.be.rejectedWith("Failed to mint license: The contract function \"mintLicense\" reverted.",
                                    "Error: LicensingModule__CallerNotLicensorAndPolicyNotSet()")
            });
        });
    });
});