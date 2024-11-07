import { privateKeyA, accountA, mockERC20Address, royaltyPolicyLAPAddress } from '../../config/config';
import { createNFTCollection, registerIpAndAttachPilTerms } from '../../utils/sdkUtils';
import { checkMintResult, getBlockTimestamp, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Address, toHex } from 'viem';
import { PIL_TYPE } from '@story-protocol/core-sdk';

const metadataURI = "http://example.com/metadata/12345";
const nftMetadataURI = "http://example.com/metadata/2";
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
                createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.spgNftContract).to.be.a("string").and.not.empty;

            nftCollectionAddress = response.spgNftContract;

            tokenIdA = await mintNFTWithRetry(privateKeyA, nftCollectionAddress, "nft-metadata-test");
            checkMintResult(tokenIdA);
                        
            tokenIdB = await mintNFTWithRetry(privateKeyA, nftCollectionAddress, "nft-metadata-test");
            checkMintResult(tokenIdB);
                        
            tokenIdC = await mintNFTWithRetry(privateKeyA, nftCollectionAddress, "nft-metadata-test");
            checkMintResult(tokenIdC);
        });

        it("Register IP and attach PilTerms fail as undefined NFT contract address", async function () {
            let nftContractAddress: any;
            await expect(
                registerIpAndAttachPilTerms("A", nftContractAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: nftContract address is invalid: undefined, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Register IP and attach PilTerms fail as invalid NFT contract address", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", "0x0000", tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: nftContract address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        // 0x1033cd88: IPAssetRegistry__UnsupportedIERC721(address)
        it("Register IP and attach PilTerms fail as non-existent NFT contract address", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", "0x121022F354787754f39f55b9795178dA291348Ba", tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: The contract function "registerIpAndAttachPILTerms" reverted with the following signature:`, `0x1033cd88`);
        });

        it("Register IP and attach PilTerms fail as undefined tokenId", async function () {
            let tokenId: any;
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenId, PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, true)
            ).to.be.rejectedWith("Failed to register IP and attach PIL terms: Cannot convert undefined to a BigInt");
        });

        it("Register IP and attach PilTerms fail as invalid tokenId", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, "test", PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, true)
            ).to.be.rejectedWith("Failed to register IP and attach PIL terms: Cannot convert test to a BigInt");
        });

        // 0x7e273289 - ERC721NonexistentToken(uint256)
        it("Register IP and attach PilTerms fail as non-existent tokenId", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, "999999999999", PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: The contract function "registerIpAndAttachPILTerms" reverted with the following signature:`, `0x7e273289`);
        });

        it("Register IP and attach PilTerms fail as undefined pilType", async function () {
            let pilType: any;
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, pilType, "10", mockERC20Address, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: PIL type is required.`);
        });

        it("Register IP and attach PilTerms fail as invalid metadataHash", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, true, metadataURI, "0x0000")
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: Size of bytes "0x0000" (bytes2) does not match expected size (bytes32).`);
        });

        it("Register IP and attach PilTerms fail as invalid nftMetadataHash", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, true, metadataURI, metadataHash, nftMetadataURI, "0x0000")
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: Size of bytes "0x0000" (bytes2) does not match expected size (bytes32).`);
        });

        it("Register IP and attach PilTerms fail as invalid deadline", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, true, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, royaltyPolicyLAPAddress, "test")
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: Invalid deadline value.`);
        });

        // 0xb3e96921 - AccessController__PermissionDenied(address,address,address,bytes4)
        it("Non-owner register IP and attach PilTerms fail", async function () {
            await expect(
                registerIpAndAttachPilTerms("B", nftCollectionAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, true, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, royaltyPolicyLAPAddress, "100", 20)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: The contract function "registerIpAndAttachPILTerms" reverted with the following signature:`, `0xb3e96921`);
        });

        it("Register IP and attach COMMERCIAL_REMIX PilTerms fail as missing required parameters", async function () {
            await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, PIL_TYPE.COMMERCIAL_REMIX, "10", mockERC20Address, true)
            ).to.be.rejectedWith(`Failed to register IP and attach PIL terms: DefaultMintingFee, currency and commercialRevShare are required for commercial remix PIL.`);
        });

        it("Register IP and attach NON_COMMERCIAL_REMIX PilTerms", async function () {          
            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdA, PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            expect(response.ipId).to.be.a("string").and.not.empty;
        });

        it("Register IP and attach NON_COMMERCIAL_REMIX PilTerms with all optional parameters", async function () {
            const tokenId = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            checkMintResult(tokenIdC);

            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenId, PIL_TYPE.NON_COMMERCIAL_REMIX, "10", mockERC20Address, false, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, royaltyPolicyLAPAddress, "100", 20)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        it("Register IP and attach COMMERCIAL_USE PilTerms", async function () {
            const deadline = await(getBlockTimestamp()) + 1000n;            
            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdB, PIL_TYPE.COMMERCIAL_USE, "10", mockERC20Address, true, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, royaltyPolicyLAPAddress, deadline, 20)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            expect(response.ipId).to.be.a("string").and.not.empty;
        });

        it("Register IP and attach COMMERCIAL_USE PilTerms with all optional parameters", async function () {
            const tokenId = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            checkMintResult(tokenIdC);

            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenId, PIL_TYPE.COMMERCIAL_USE, "10", mockERC20Address, undefined, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, royaltyPolicyLAPAddress, "100", 20)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTermsId).to.not.be.exist;
            expect(response.ipId).to.not.be.exist;
        });

        it("Register IP and attach COMMERCIAL_REMIX PilTerms", async function () {
            const deadline = await(getBlockTimestamp()) + 1000n;            
            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenIdC, PIL_TYPE.COMMERCIAL_REMIX, "10", mockERC20Address, true, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, royaltyPolicyLAPAddress, "100", 20)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            expect(response.ipId).to.be.a("string").and.not.empty;
        });

        it("Register IP and attach COMMERCIAL_REMIX PilTerms with all optional parameters", async function () {
            const tokenId = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            checkMintResult(tokenIdC);

            const response = await expect(
                registerIpAndAttachPilTerms("A", nftCollectionAddress, tokenId, PIL_TYPE.COMMERCIAL_REMIX, "10", mockERC20Address, true, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, royaltyPolicyLAPAddress, "100", 20)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            expect(response.ipId).to.be.a("string").and.not.empty;
        });
    });
});
