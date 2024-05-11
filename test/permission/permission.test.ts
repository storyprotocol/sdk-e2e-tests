import { nftContractAddress, privateKeyA, accountB, licensingModuleAddress } from '../../config/config';
import { registerIpAsset, setPermission } from '../../utils/sdkUtils';
import { checkMintResult, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai';
import { Hex } from 'viem';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';

let tokenIdA: string;
let ipIdA: Hex;

describe('SDK Test', function () {
    describe('Test ipAsset.register Function', async function () {
        before("Mint NFT and Register IP Asset",async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            checkMintResult(tokenIdA);

            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, true)
            ).to.not.be.rejected
        
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;
        
            ipIdA = response.ipId
        });

        it("Non-owner set permission", async function () {            
            const response = await expect(
                setPermission("B", ipIdA, accountB.address, licensingModuleAddress, 1, true)
            ).to.be.rejectedWith("Failed to set permissions: The contract function \"execute\" reverted with the following signature:", 
                                 "0xb3e96921");
        });

        it("Set permission with an empty IP id", async function () {
            let testIpId:any;            
            const response = await expect(
                setPermission("A", testIpId, accountB.address, licensingModuleAddress, 1, true)
            ).to.be.rejectedWith("Failed to set permissions: Address \"undefined\" is invalid.");
        });

        it("Set permission with a non-existent IP id", async function () {            
            const response = await expect(
                setPermission("B", "0x1954631f55AC9a79CC4ec57103D23A9b2e8aDBfa", accountB.address, licensingModuleAddress, 1, true)
            ).to.be.rejectedWith("Failed to set permissions: The contract function \"execute\" returned no data (\"0x\").");
        });

        it("Set permission with an invalid IP id", async function () {            
            const response = await expect(
                setPermission("A", "0x00000", accountB.address, licensingModuleAddress, 1, true)
            ).to.be.rejectedWith("Failed to set permissions: Address \"0x00000\" is invalid.");
        });

        it("Set permission with an empty signer address", async function () {
            let accountAddress:any;            
            const response = await expect(
                setPermission("A", ipIdA, accountAddress, licensingModuleAddress, 1, true)
            ).to.be.rejectedWith("Failed to set permissions: Address \"undefined\" is invalid.");
        });

        it("Set permission with an invalid signer address", async function () {            
            const response = await expect(
                setPermission("A", ipIdA, "0x00000", licensingModuleAddress, 1, true)
            ).to.be.rejectedWith("Failed to set permissions: Address \"0x00000\" is invalid.");
        });

        it("Set permission with an emty license module address", async function () {
            let testLicenseAddress: any;           
            const response = await expect(
                setPermission("A", ipIdA, accountB.address, testLicenseAddress, 1, true)
            ).to.be.rejectedWith("Failed to set permissions: Address \"undefined\" is invalid.");
        });
        
        it("Set permission with an invalid license module address", async function () {            
            const response = await expect(
                setPermission("A", ipIdA, accountB.address, "0x0000", 1, true)
            ).to.be.rejectedWith("Failed to set permissions: Address \"0x0000\" is invalid.");
        });

        it("Set permission with an invalid permission id (-1)", async function () {            
            const response = await expect(
                setPermission("A", ipIdA, accountB.address, licensingModuleAddress, -1, true)
            ).to.be.rejectedWith("Failed to set permissions: Number \"-1\" is not in safe 256-bit unsigned integer range");
        });

        it("Set permission with an invalid permission id (4)", async function () {            
            const response = await expect(
                setPermission("A", ipIdA, accountB.address, licensingModuleAddress, 4, true)
            ).to.be.rejectedWith("Failed to set permissions: The contract function \"execute\" reverted with the following signature:", 
                                 "0x07e5a971");
        });

        it("Set permission (permission id: 1) to wallet B", async function () {            
            const response = await expect(
                setPermission("A", ipIdA, accountB.address, licensingModuleAddress, 1, true)
            ).to.not.be.rejected;
        
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.success).to.be.true
        });

        it("Set permission (permission id: 1) that is already set 1 to wallet B", async function () {            
            const response = await expect(
                setPermission("A", ipIdA, accountB.address, licensingModuleAddress, 1, true)
            ).to.not.be.rejected;
        
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.success).to.be.true
        });

        it("Set permission (permission id: 2) to wallet B", async function () {            
            const response = await expect(
                setPermission("A", ipIdA, accountB.address, licensingModuleAddress, 2, true)
            ).to.not.be.rejected;
        
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.success).to.be.true
        });

        it("Set permission (permission id: 0) to wallet B", async function () {            
            const response = await expect(
                setPermission("A", ipIdA, accountB.address, licensingModuleAddress, 0, true)
            ).to.not.be.rejected;
        
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.success).to.be.true
        });
    });
});
