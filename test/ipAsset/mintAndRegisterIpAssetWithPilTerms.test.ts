import { accountA, mintingFeeTokenAddress } from '../../config/config';
import { createNFTCollection, mintAndRegisterIpAssetWithPilTerms } from '../../utils/sdkUtils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Hex, toHex } from 'viem';
import { PIL_TYPE } from '@story-protocol/core-sdk';

const metadataURI = "http://example.com/metadata/12345";
const metadataHash = toHex("test-metadata-hash", { size: 32 });
const nftMetadataHash = toHex("test-nft-metadata-hash", { size: 32 });
let nftCollectionAddress: Hex;

describe('SDK Test', function () {
    before("Create NFT collection",async function () {
        const response = await expect(
            createNFTCollection("A", "sdk-e2e-test", "test", true)
        ).to.not.be.rejected;

        expect(response.txHash).to.be.a("string").and.not.empty;
        expect(response.nftContract).to.be.a("string").and.not.empty;

        nftCollectionAddress = response.nftContract;
    });

    describe('Test ipAsset.registerDerivativeIp Function', async function () {
        it("Register an IP asset fail as undefined NFT contract address", async function () {
            let nftContractAddress: any;
            await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftContractAddress, PIL_TYPE.NON_COMMERCIAL_REMIX)
            ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Address "undefined" is invalid.`);
        });

        it("Register an IP asset fail as invalid NFT contract address", async function () {
            await expect(
                mintAndRegisterIpAssetWithPilTerms("A", "0x0000", PIL_TYPE.NON_COMMERCIAL_REMIX)
            ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Address "0x0000" is invalid.`);
        });

        it("Register an IP asset fail as non-existent NFT contract address", async function () {
            await expect(
                mintAndRegisterIpAssetWithPilTerms("A", "0x121022F354787754f39f55b9795178dA291348Ba", PIL_TYPE.NON_COMMERCIAL_REMIX)
            ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Execution reverted for an unknown reason.`);
        });

        it("Register an IP asset fail as undefined pilType", async function () {
            let pilType: any;
            await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, pilType)
            ).to.be.rejectedWith("Failed to mint and register IP and attach PIL terms: PIL type is required.");
        });

        it("Register an IP asset fail as invalid metadataHash", async function () {
            await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.NON_COMMERCIAL_REMIX, true, metadataURI, "0x0000")
            ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Size of bytes "0x0000" (bytes2) does not match expected size (bytes32).`);
        });

        it("Register an IP asset fail as invalid nftMetadataHash", async function () {
            await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.NON_COMMERCIAL_REMIX, true, metadataURI, undefined, "0x0000")
            ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Size of bytes "0x0000" (bytes2) does not match expected size (bytes32).`);
        });

        it("Register an IP asset fail as invalid recipient", async function () {
            await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.NON_COMMERCIAL_REMIX, true, metadataURI, undefined, undefined, "0x000")
            ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Address "0x000" is invalid.`);
        });

        it("Register an IP asset fail as missing required parameters for commercial use PIL", async function () {
            await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.COMMERCIAL_USE, true)
            ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: mintingFee currency are required for commercial use PIL.`);
        });

        it("Register an IP asset fail as missing required parameters for commercial remix PIL", async function () {
            await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.COMMERCIAL_REMIX, true)
            ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: mintingFee, currency and commercialRevShare are required for commercial remix PIL.`);
        });

        it("Non-owner register an IP asset fail", async function () {
            await expect(
                mintAndRegisterIpAssetWithPilTerms("B", nftCollectionAddress, PIL_TYPE.NON_COMMERCIAL_REMIX, true)
            ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: The contract function "mintAndRegisterIpAndAttachPILTerms" reverted.`, `Error: SPG__CallerNotMinterRole()`);
        });

        it("Register an IP asset with waitForTransaction: false", async function () {            
            const response = await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.NON_COMMERCIAL_REMIX, false)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.not.be.exist;
            expect(response.tokenId).to.not.be.exist;
            expect(response.licenseTermsId).to.not.be.exist;
        });

        it("Register an IP asset with non-commercial remix license terms", async function () {            
            const response = await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.NON_COMMERCIAL_REMIX, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;
            expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
        });

        it("Register an IP asset with commercial use license terms", async function () {            
            const response = await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.COMMERCIAL_USE, true, undefined, undefined, undefined, undefined, "80", undefined, mintingFeeTokenAddress)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;
            expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
        });

        it("Register an IP asset with commercial remix license terms", async function () {            
            const response = await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.COMMERCIAL_REMIX, true, undefined, undefined, undefined, undefined, "60", 20, mintingFeeTokenAddress)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;
            expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
        });

        it("Register an IP asset with non-commercial remix license terms and all optional parameters", async function () {
            const response = await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.NON_COMMERCIAL_REMIX, true, metadataURI, metadataHash, nftMetadataHash, accountA.address)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;
            expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
        });

        it("Register an IP asset with commercial use license terms and all optional parameters", async function () {
            const response = await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.COMMERCIAL_USE, true, metadataURI, metadataHash, nftMetadataHash, accountA.address, "100", undefined, mintingFeeTokenAddress)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;
            expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
        });

        it("Register an IP asset with commercial remix license terms and all optional parameters", async function () {
            const response = await expect(
                mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, PIL_TYPE.COMMERCIAL_REMIX, true, metadataURI, metadataHash, nftMetadataHash, accountA.address, "100", 10, mintingFeeTokenAddress)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;
            expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
        });
    });
});
