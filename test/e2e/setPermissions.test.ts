import { privateKeyA, accountB, licensingModuleAddress, nftContractAddress} from '../../config/config';
import { checkMintResult, mintNFTWithRetry } from '../../utils/utils';
import { registerIpAsset, setPermission, attachLicenseTerms } from '../../utils/sdkUtils';
import { expect } from 'chai';
import { Hex } from 'viem';
import '../setup';
import { nonComLicenseTermsId, comUseLicenseTermsId1 } from '../setup';

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Hex;
let ipIdB: Hex;

const waitForTransaction: boolean = true;

describe('@smoke SDK E2E Test - Permissions', function () {
    this.beforeAll("Wallet A register 2 license terms and 2 IP assets", async function () {                        
        tokenIdA = await mintNFTWithRetry(privateKeyA);
        checkMintResult(tokenIdA);
    
        const responseRegisterIpA = await expect(
            registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
        ).to.not.be.rejected;

        expect(responseRegisterIpA.txHash).to.be.a("string").and.not.empty;
        expect(responseRegisterIpA.ipId).to.be.a("string").and.not.empty;

        ipIdA = responseRegisterIpA.ipId;

        tokenIdB = await mintNFTWithRetry(privateKeyA);
        checkMintResult(tokenIdB);
    
        const responseRegisterIpB = await expect(
            registerIpAsset("A", nftContractAddress, tokenIdB, waitForTransaction)
        ).to.not.be.rejected;

        expect(responseRegisterIpB.txHash).to.be.a("string").and.not.empty;
        expect(responseRegisterIpB.ipId).to.be.a("string").and.not.empty;

        ipIdB = responseRegisterIpB.ipId;
    })
    
    describe("Set permission - 1 ALLOW", async function (){
        // error 0xb3e96921: AccessController__PermissionDenied(address,address,address,bytes4)
        step("Wallet B(non-owner) can NOT attach licenseTermsId1 to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("B", ipIdA, nonComLicenseTermsId, waitForTransaction)
            ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted with the following signature:", "0xb3e96921");
        });            

        // wallet B is granted permission - 1 ALLOW for ipIdA 
        step("Wallet A set permission (permission id: 1) to allow Wallet B to call license Module for ipIdA", async function () {
            const response = await expect(
                setPermission("A", ipIdA, accountB.address, licensingModuleAddress, 1, waitForTransaction)
            ).to.not.be.rejected;
    
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.success).to.be.true;
        });

        step("Wallet B can attach licenseTermsId1 to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("B", ipIdA, nonComLicenseTermsId, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        // wallet B is not granted any permission for ipIdB
        // error 0xb3e96921: AccessController__PermissionDenied(address,address,address,bytes4)
        step("Wallet B can NOT attach licenseTermsId1 to ipIdB", async function () {
            const response = await expect(
                attachLicenseTerms("B", ipIdB, nonComLicenseTermsId, waitForTransaction)
            ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted with the following signature:", "0xb3e96921");
        });
    });
    
    describe("Set permission - 2 DENY", async function (){                            
        // change wallet B's permission to 2 DENY for ipIdA
        step("Wallet A set permission (permission id: 2) to NOT allow Wallet B to call license Module for ipIdA", async function () {
            const response = await expect(
                setPermission("A", ipIdA, accountB.address, licensingModuleAddress, 2, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.success).to.be.true;
        });
        
        // error 0xb3e96921: AccessController__PermissionDenied(address,address,address,bytes4)
        step("Wallet B can NOT attach licenseTermsId1 to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("B", ipIdA, comUseLicenseTermsId1, waitForTransaction)
            ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted with the following signature:", "0xb3e96921");
        });
    });
    
    describe("Set permission - 0 ABSTAIN", async function (){
        // wallet B is granted permission - 1 ALLOW for ipIdB
        step("Wallet A set permission (permission id: 1) to allow Wallet B to call license Module for ipIdB", async function () {
            const response = await expect(
                setPermission("A", ipIdB, accountB.address, licensingModuleAddress, 1, waitForTransaction)
            ).to.not.be.rejected;
    
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.success).to.be.true;
        });

        step("Wallet B can attach licenseTermsId1 to ipIdB", async function () {
            const response = await expect(
                attachLicenseTerms("B", ipIdB, nonComLicenseTermsId, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });
        
        // change wallet B's permission to 0 ABSTAIN for ipIdB 
        step("Wallet A set permission (permission id: 0) to NOT allow Wallet B to call license Module for ipIdB", async function () {
            const response = await expect(
                setPermission("A", ipIdB, accountB.address, licensingModuleAddress, 0, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.success).to.be.true;
        });
        
        // error 0xb3e96921: AccessController__PermissionDenied(address,address,address,bytes4)
        step("Wallet B can NOT attach licenseTermsId2 to ipIdB", async function () {
            const response = await expect(
                attachLicenseTerms("B", ipIdB, comUseLicenseTermsId1, waitForTransaction)
            ).to.be.rejectedWith("Failed to attach license terms: The contract function \"attachLicenseTerms\" reverted with the following signature:", "0xb3e96921");
        });
    });
});
