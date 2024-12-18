import { accountA, mockERC20Address, royaltyPolicyLAPAddress } from '../../config/config';
import { createNFTCollection, mintAndRegisterIpAssetWithPilTerms } from '../../utils/sdkUtils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Hex, toHex } from 'viem';
import { terms } from '../../utils/constants';

const metadataURI = "http://example.com/metadata/12345";
const nftMetadataURI = "http://example.com/metadata/2";
const metadataHash = toHex("test-metadata-hash", { size: 32 });
const nftMetadataHash = toHex("test-nft-metadata-hash", { size: 32 });
let nftCollectionAddress: Hex;

describe.only('SDK Test', function () {
  before("Create NFT collection",async function () {
    const response = await expect(
      createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", true)
    ).to.not.be.rejected;

    expect(response.txHash).to.be.a("string").and.not.empty;
    expect(response.spgNftContract).to.be.a("string").and.not.empty;

    nftCollectionAddress = response.spgNftContract;
  });

  describe('Test ipAsset.registerDerivativeIp Function', async function () {
    it("Register an IP asset fail as undefined NFT contract address", async function () {
      let nftContractAddress: any;
      await expect(
        mintAndRegisterIpAssetWithPilTerms("A", nftContractAddress, [terms])
      ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: request.spgNftContract address is invalid: undefined, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
    });

    it("Register an IP asset fail as invalid NFT contract address", async function () {
      await expect(
        mintAndRegisterIpAssetWithPilTerms("A", "0x0000", [terms])
      ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: request.spgNftContract address is invalid: 0x0000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
    });

    it("Register an IP asset fail as non-existent NFT contract address", async function () {
      await expect(
        mintAndRegisterIpAssetWithPilTerms("A", "0x121022F354787754f39f55b9795178dA291348Ba", [terms])
      ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Execution reverted for an unknown reason.`);
    });

    it("Register an IP asset fail as undefined terms", async function () {
      let testTerms: any;
      await expect(
        mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, testTerms)
      ).to.be.rejectedWith("Failed to mint and register IP and attach PIL terms: Cannot read properties of undefined (reading 'length')");
    });

    it("Register an IP asset fail as invalid metadataHash", async function () {
      await expect(
        mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [terms], true, metadataURI, "0x0000")
      ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Size of bytes "0x0000" (bytes2) does not match expected size (bytes32).`);
    });

    it("Register an IP asset fail as invalid nftMetadataHash", async function () {
      await expect(
        mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [terms], true, metadataURI, undefined, undefined, "0x0000")
      ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Size of bytes "0x0000" (bytes2) does not match expected size (bytes32).`);
    });

    it("Register an IP asset fail as invalid recipient", async function () {
      await expect(
        mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [terms], true, undefined, undefined, undefined, undefined, "0x000")
      ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: request.recipient address is invalid: 0x000, Address must be a hex value of 20 bytes (40 hex characters) and match its checksum counterpart.`);
    });

    it("Register an IP asset fail as missing required parameters for commercialUse is true", async function () {
      const testTerms = terms;
      testTerms.commercialUse = true;

      await expect(
        mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [testTerms], true)
      ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Royalty policy is required when commercial use is enabled.`);
    });

    it.only("Register an IP asset fail as missing required parameters for commercialUse is true", async function () {
      const testTerms = terms;
      testTerms.commercialUse = true;
      testTerms.royaltyPolicy = royaltyPolicyLAPAddress;
      console.log(testTerms);

      await expect(
        mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [testTerms], true)
      ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Royalty policy requires currency token.`);
    });

    it.only("Register an IP asset with commercialUse is true", async function () {
      const testTerms = terms;
      testTerms.commercialUse = true;
      testTerms.royaltyPolicy = royaltyPolicyLAPAddress;
      testTerms.currency = mockERC20Address;
      console.log(testTerms);

      await expect(
        mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [testTerms], true)
      ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: Royalty policy requires currency token.`);
    });

    it("Register an IP asset fail as missing required parameters for commercial remix PIL", async function () {
        await expect(
            mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [terms], true)
        ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: DefaultMintingFee, currency and commercialRevShare are required for commercial remix PIL.`);
    });

    it("Non-owner register an IP asset fail", async function () {
        // await expect(
        await
            mintAndRegisterIpAssetWithPilTerms("B", nftCollectionAddress, [terms], true)
        // ).to.be.rejectedWith(`Failed to mint and register IP and attach PIL terms: The contract function "mintAndRegisterIpAndAttachPILTerms" reverted.`, `Error: SPG__CallerNotMinterRole()`);
    });

    it("Register an IP asset with waitForTransaction: false", async function () {            
        const response = await expect(
            mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [terms], false, undefined, undefined, undefined, undefined, undefined)
        ).to.not.be.rejected;

        expect(response.txHash).to.be.a("string").and.not.empty;
        expect(response.ipId).to.not.be.exist;
        expect(response.tokenId).to.not.be.exist;
        expect(response.licenseTermsId).to.not.be.exist;
    });

    it("Register an IP asset with non-commercial remix license terms id 2", async function () {            
        const response = await expect(
            mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [terms], true)
        ).to.not.be.rejected;

        expect(response.txHash).to.be.a("string").and.not.empty;
        expect(response.ipId).to.be.a("string").and.not.empty;
        expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
        expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
    });

    it("Register an IP asset with commercial use license terms", async function () {            
        const response = await expect(
            mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [terms], true, undefined, undefined, undefined, undefined, undefined)
        ).to.not.be.rejected;

        expect(response.txHash).to.be.a("string").and.not.empty;
        expect(response.ipId).to.be.a("string").and.not.empty;
        expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
        expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
    });

    it("Register an IP asset with commercial remix license terms", async function () {            
        const response = await expect(
            mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [terms], true, undefined, undefined, undefined, undefined, undefined)
        ).to.not.be.rejected;

        expect(response.txHash).to.be.a("string").and.not.empty;
        expect(response.ipId).to.be.a("string").and.not.empty;
        expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
        expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
    });

    it("Register an IP asset with non-commercial remix license terms id 2 and all optional parameters", async function () {
        const response = await expect(
            mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [terms], true, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, accountA.address)
        ).to.not.be.rejected;

        expect(response.txHash).to.be.a("string").and.not.empty;
        expect(response.ipId).to.be.a("string").and.not.empty;
        expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
        expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
    });

    it("Register an IP asset with commercial use license terms and all optional parameters", async function () {
        const response = await expect(
            mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [terms], true, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, accountA.address)
        ).to.not.be.rejected;

        expect(response.txHash).to.be.a("string").and.not.empty;
        expect(response.ipId).to.be.a("string").and.not.empty;
        expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
        expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
    });

    it("Register an IP asset with commercial remix license terms and all optional parameters", async function () {
        const response = await expect(
            mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [terms], true, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, accountA.address)
        ).to.not.be.rejected;

        expect(response.txHash).to.be.a("string").and.not.empty;
        expect(response.ipId).to.be.a("string").and.not.empty;
        expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
        expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
    });
  });
});
