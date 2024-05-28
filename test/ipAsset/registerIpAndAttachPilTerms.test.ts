import { privateKeyA, mintingFeeTokenAddress } from '../../config/config';
import { createNFTCollection, registerIpAndAttachPilTerms } from '../../utils/sdkUtils';
import { checkMintResult, getBlockTimestamp, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Address, toHex } from 'viem';
import { PIL_TYPE } from '@story-protocol/core-sdk';

const metadataURI = "http://example.com/metadata/12345";
const metadataHash = toHex("test-metadata-hash", { size: 32 });
const nftMetadataHash = toHex("test-nft-metadata-hash", { size: 32 });
let nftCollectionAddress: Address;
let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;

describe('SDK Test', function () {
    describe('Test ipAsset.registerIpAndAttachPilTerms Function', async function () {
        before("Mint NFT, register IP assets and attach license terms",async function () {
            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.nftContract).to.be.a("string").and.not.empty;

            nftCollectionAddress = response.nftContract;

            tokenIdA = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            checkMintResult(tokenIdA);
                        
            tokenIdB = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            checkMintResult(tokenIdB);
                        
            tokenIdC = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            checkMintResult(tokenIdC);
        });

        it("Register IP and attach PilTerms fail as undefined NFT contract address", async function () {
            let nftContractAddress: any;
            await expect(
                registerIpAndAttachPilTerms("A", nftContractAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: Address "undefined" is invalid.`);
        });

        it("Register IP and attach PilTerms fail as invalid NFT contract address", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", "0x0000", tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: Address "0x0000" is invalid.`);
        });

        // 0x1033cd88: IPAssetRegistry__UnsupportedIERC721(address)
        it("Register IP and attach PilTerms fail as non-existent NFT contract address", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", "0x121022F354787754f39f55b9795178dA291348Ba", tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: The contract function "registerIpAndAttachPILTerms" reverted with the following signature:`, `0x1033cd88`);
        });

        it("Register IP and attach PilTerms fail as undefined tokenId", async function () {
            let tokenId: any;
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenId, PIL_TYPE.NON_COMMERCIAL_REMIX, true)
            ).to.be.rejectedWith("Failed to register IP and attach PIL terms: Cannot convert undefined to a BigInt");
        });

        it("Register IP and attach PilTerms fail as invalid tokenId", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, "test", PIL_TYPE.NON_COMMERCIAL_REMIX, true)
            ).to.be.rejectedWith("Failed to register IP and attach PIL terms: Cannot convert test to a BigInt");
        });

        // 0x7e273289 - ERC721NonexistentToken(uint256)
        it("Register IP and attach PilTerms fail as non-existent tokenId", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, "999999999999", PIL_TYPE.NON_COMMERCIAL_REMIX, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: The contract function "registerIpAndAttachPILTerms" reverted with the following signature:`, `0x7e273289`);
        });

        it("Register IP and attach PilTerms fail as undefined pilType", async function () {
            let pilType: any;
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, pilType, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: PIL type is required.`);
        });

        it("Register IP and attach PilTerms fail as invalid metadataHash", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, true, metadataURI, "0x0000")
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: Size of bytes "0x0000" (bytes2) does not match expected size (bytes32).`);
        });

        it("Register IP and attach PilTerms fail as invalid nftMetadataHash", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, true, metadataURI, metadataHash, "0x0000")
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: Size of bytes "0x0000" (bytes2) does not match expected size (bytes32).`);
        });

        it("Register IP and attach PilTerms fail as invalid deadline", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, true, metadataURI, metadataHash, nftMetadataHash, "test")
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: Invalid deadline value.`);
        });

        // 0xb3e96921 - AccessController__PermissionDenied(address,address,address,bytes4)
        it("Non-owner register IP and attach PilTerms fail", async function () {
            await expect(
                registerIpAndAttachPilTerms("B", nftCollectionAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, true, metadataURI, metadataHash, nftMetadataHash, 1000n, "100", 20, mintingFeeTokenAddress)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: The contract function "registerIpAndAttachPILTerms" reverted with the following signature:`, `0xb3e96921`);
        });

        it("Register IP and attach COMMERCIAL_USE PilTerms fail as missing required parameters", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, PIL_TYPE.COMMERCIAL_USE, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: mintingFee currency are required for commercial use PIL.`);
        });

        it("Register IP and attach COMMERCIAL_REMIX PilTerms fail as missing required parameters", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, PIL_TYPE.COMMERCIAL_REMIX, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: mintingFee, currency and commercialRevShare are required for commercial remix PIL.`);
        });

        it("Register IP and attach NON_COMMERCIAL_REMIX PilTerms", async function () {          
            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            expect(response.ipId).to.be.a("string").and.not.empty;
        });

        it("Register IP and attach NON_COMMERCIAL_REMIX PilTerms with all optional parameters", async function () {
            const tokenId = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            checkMintResult(tokenIdC);

            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenId, PIL_TYPE.NON_COMMERCIAL_REMIX, false, metadataURI, metadataHash, nftMetadataHash, 1000n, "100", 20, mintingFeeTokenAddress)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTermsId).to.not.be.exist;
            expect(response.ipId).to.not.be.exist;
        });

        it("Register IP and attach COMMERCIAL_USE PilTerms", async function () {
            const deadline = await(getBlockTimestamp()) + 1000n;            
            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdB, PIL_TYPE.COMMERCIAL_USE, true, metadataURI, metadataHash, nftMetadataHash, deadline, "100", undefined, mintingFeeTokenAddress)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            expect(response.ipId).to.be.a("string").and.not.empty;
        });

        it("Register IP and attach COMMERCIAL_USE PilTerms with all optional parameters", async function () {
            const tokenId = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            checkMintResult(tokenIdC);

            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenId, PIL_TYPE.COMMERCIAL_USE, undefined, metadataURI, metadataHash, nftMetadataHash, 1000n, "100", 20, mintingFeeTokenAddress)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTermsId).to.not.be.exist;
            expect(response.ipId).to.not.be.exist;
        });

        it("Register IP and attach COMMERCIAL_REMIX PilTerms", async function () {
            const deadline = await(getBlockTimestamp()) + 1000n;            
            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdC, PIL_TYPE.COMMERCIAL_REMIX, true, metadataURI, metadataHash, nftMetadataHash, deadline, "100", 20, mintingFeeTokenAddress)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            expect(response.ipId).to.be.a("string").and.not.empty;
        });

        it("Register IP and attach COMMERCIAL_REMIX PilTerms with all optional parameters", async function () {
            const tokenId = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            checkMintResult(tokenIdC);

            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenId, PIL_TYPE.COMMERCIAL_REMIX, true, metadataURI, metadataHash, nftMetadataHash, 1000n, "100", 20, mintingFeeTokenAddress)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            expect(response.ipId).to.be.a("string").and.not.empty;
        });
    });
});

