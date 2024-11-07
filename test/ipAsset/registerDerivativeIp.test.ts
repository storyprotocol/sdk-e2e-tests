import { privateKeyA, nftContractAddress, accountA, licenseTemplateAddress } from '../../config/config';
import { attachLicenseTerms, registerDerivativeIp, registerIpAsset, createNFTCollection } from '../../utils/sdkUtils';
import { checkMintResult, getBlockTimestamp, mintNFTWithRetry } from '../../utils/utils';
import { expect } from 'chai';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Address, toHex } from 'viem';
import { comRemixLicenseTermsId1, nonComLicenseTermsId } from '../setup';

let tokenIdA: string;
let tokenIdB: string;
let ipIdA: Address;
let nftCollectionAddress: Address;
const metadataURI = "http://example.com/metadata/1";
const nftMetadataURI = "http://example.com/metadata/2";

describe('SDK Test', function () {
    describe('Test ipAsset.registerDerivativeIp Function', async function () {
        before("Mint NFT, register IP assets and attach license terms",async function () {
            console.log(accountA.address);
            const response = await expect(
                createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.spgNftContract).to.be.a("string").and.not.empty;

            nftCollectionAddress = response.spgNftContract as Address;
            console.log(nftCollectionAddress);

            
            tokenIdA = await mintNFTWithRetry(privateKeyA, nftCollectionAddress, "nft-metadata-test");
            checkMintResult(tokenIdA);
            console.log(tokenIdA);
                        
            tokenIdB = await mintNFTWithRetry(privateKeyA, nftCollectionAddress, "nft-metadata-test");
            checkMintResult(tokenIdB);
            console.log(tokenIdB);
            
            const responseRegisterIpA = await expect(
                registerIpAsset("A", nftCollectionAddress, tokenIdA, true)
            ).to.not.be.rejected;

            expect(responseRegisterIpA.txHash).to.be.a("string").and.not.empty;
            expect(responseRegisterIpA.ipId).to.be.a("string").and.not.empty;

            ipIdA = responseRegisterIpA.ipId;
            
            const attachLicenseTermsResponse = await expect(
                attachLicenseTerms("A", ipIdA, 0n, true)
            ).to.not.be.rejected;

            expect(attachLicenseTermsResponse.txHash).to.be.a("string").and.not.empty;
        });

        it("Register a derivative IP asset fail as undefined NFT contract address", async function () {
            let nftContractAddress: any;
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenIdB, [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative IP: nftContract address is invalid: undefined, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Register a derivative IP asset fail as invalid NFT contract address", async function () {
            await expect(
                registerDerivativeIp("A", "0x0000", tokenIdB, [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative IP: nftContract address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        // 0x1033cd88: IPAssetRegistry__UnsupportedIERC721(address)
        it("Register a derivative IP asset fail as non-existent NFT contract address", async function () {
            await expect(
                registerDerivativeIp("A", "0x121022F354787754f39f55b9795178dA291348Ba", tokenIdB, [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative IP: The contract function "registerIpAndMakeDerivative" reverted with the following signature:`, `0x1033cd88`);
        });

        it("Register a derivative IP asset fail as undefined tokenId", async function () {
            let tokenId: any;
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenId, [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith("Failed to register derivative IP: Cannot convert undefined to a BigInt");
        });

        it("Register a derivative IP asset fail as invalid tokenId", async function () {
            await expect(
                registerDerivativeIp("A", nftContractAddress, "test", [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith("Failed to register derivative IP: Cannot convert test to a BigInt");
        });

        it("Register a derivative IP asset fail as non-existent tokenId", async function () {
            await expect(
                registerDerivativeIp("A", nftContractAddress, "999999999999", [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative IP: The contract function "registerIpAndMakeDerivative" reverted with the following signature:`, `0x1033cd88`);
        });

        it("Register a derivative IP asset fail as undefined ipId", async function () {
            let ipId: any;
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenIdB, [ipId], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative IP: request.derivData.parentIpIds address is invalid: undefined, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Register a derivative IP asset fail as invalid ipId", async function () {
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenIdB, ["0x0000"], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative IP: request.derivData.parentIpIds address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Register a derivative IP asset fail as undefined licenseTermsId", async function () {
            let licenseTermsId: any;
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenIdB, [ipIdA], [licenseTermsId], true)
            ).to.be.rejectedWith("Failed to register derivative IP: Cannot convert undefined to a BigInt");
        });

        it("Register a derivative IP asset fail as invalid licenseTermsId", async function () {
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenIdB, [ipIdA], ["test"], true)
            ).to.be.rejectedWith("Failed to register derivative IP: Cannot convert test to a BigInt");
        });

        it("Register a derivative IP asset fail as unattached licenseTermsId", async function () {
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenIdB, [ipIdA], [comRemixLicenseTermsId1], true)
            ).to.be.rejectedWith(`Failed to register derivative IP: License terms id ${comRemixLicenseTermsId1} must be attached to the parent ipId ${ipIdA} before registering derivative.`);
        });

        it("Register a derivative IP asset fail as parent id and licenseTermsId not in pairs", async function () {
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenIdB, [ipIdA, ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith("Failed to register derivative IP: Parent IP IDs and License terms IDs must be provided in pairs.");
        });

        it("Register a derivative IP asset fail as invalid licenseTemplate", async function () {
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenIdB, [ipIdA], [nonComLicenseTermsId], true, "0x0000")
            ).to.be.rejectedWith(`Failed to register derivative IP: request.derivData.licenseTemplate address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
        });

        it("Register a derivative IP asset fail as invalid metadataHash", async function () {
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenIdB, [ipIdA], [nonComLicenseTermsId], true, undefined, metadataURI, "0x0000")
            ).to.be.rejectedWith(`Failed to register derivative IP: Size of bytes "0x0000" (bytes2) does not match expected size (bytes32).`);
        });

        it("Register a derivative IP asset fail as invalid nftMetadataHash", async function () {
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenIdB, [ipIdA], [nonComLicenseTermsId], true, undefined, metadataURI, undefined, undefined, "0x0000")
            ).to.be.rejectedWith(`Failed to register derivative IP: Size of bytes "0x0000" (bytes2) does not match expected size (bytes32).`);
        });

        it("Register a derivative IP asset fail as invalid deadline", async function () {
            await expect(
                registerDerivativeIp("A", nftContractAddress, tokenIdB, [ipIdA], [nonComLicenseTermsId], true, undefined, metadataURI, undefined, undefined, undefined, "test")
            ).to.be.rejectedWith(`Failed to register derivative IP: Invalid deadline value.`);
        });

        it("Register a derivative IP asset success", async function () {            
            const response = await expect(
                registerDerivativeIp("A", nftCollectionAddress, tokenIdB, [ipIdA], [nonComLicenseTermsId], true)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;
        });

        it("Register a derivative IP asset with undefined waitForTransaction", async function () {
            let waitForTransaction: any;
            const tokenIdC = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            checkMintResult(tokenIdC);

            const response = await expect(
                registerDerivativeIp("A", nftCollectionAddress, tokenIdC, [ipIdA], [nonComLicenseTermsId], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.not.be.exist;
        });

        it("Register a derivative IP asset with waitForTransaction: false", async function () {
            const tokenIdC = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            expect(tokenIdC).to.be.a("string").and.not.empty;

            const response = await expect(
                registerDerivativeIp("A", nftCollectionAddress, tokenIdC, [ipIdA], [nonComLicenseTermsId], false)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.not.be.exist;
        });

        it("Register a derivative IP asset fail as already registered", async function () {            
            await expect(
                registerDerivativeIp("A", nftCollectionAddress, tokenIdB, [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative IP: The NFT with id ${tokenIdB} is already registered as IP.`);
        });

        // 0xb3e96921 - AccessController__PermissionDenied(address,address,address,bytes4)
        it("Non-owner register a derivative IP asset fail", async function () { 
            const tokenIdC = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            expect(tokenIdC).to.be.a("string").and.not.empty;

            await expect(
                registerDerivativeIp("B", nftCollectionAddress, tokenIdC, [ipIdA], [nonComLicenseTermsId], true)
            ).to.be.rejectedWith(`Failed to register derivative IP: The contract function "registerIpAndMakeDerivative" reverted with the following signature:`, `0xb3e96921`);
        });

        it("Register a derivative IP asset with all optional parameters", async function () {
            const licenseTemplate = licenseTemplateAddress;
            const metadataHash = toHex("test-metadata-hash", { size: 32 });
            const nftMetadataHash = toHex("test-nft-metadata-hash", { size: 32 });
            const deadline = await(getBlockTimestamp()) + 1000n;

            const tokenIdC = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
            expect(tokenIdC).to.be.a("string").and.not.empty;

            const response = await expect(
                registerDerivativeIp("A", nftCollectionAddress, tokenIdC, [ipIdA], [nonComLicenseTermsId], true, licenseTemplate, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, deadline)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;
        });
    });
});
