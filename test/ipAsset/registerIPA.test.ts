import { accountA, licenseTemplateAddress, mockERC20Address, privateKeyA, royaltyPolicyLAPAddress } from '../../config/config';
import { attachLicenseTerms, createNFTCollection, mintAndRegisterIpAssetWithPilTerms, registerDerivative, registerDerivativeIp, registerIpAsset } from '../../utils/sdkUtils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Hex, toHex, zeroAddress } from 'viem';
import { PIL_TYPE } from '@story-protocol/core-sdk';
import { comRemixLicenseTermsId1, comRemixLicenseTermsId2, comUseLicenseTermsId1, comUseLicenseTermsId2 } from '../setup';
import { get } from 'http';
import { getBlockTimestamp, mintNFTWithRetry } from '../../utils/utils';
import { register } from 'module';

const metadataURI = "http://example.com/metadata/12345";
const nftMetadataURI = "http://example.com/metadata/2";
const metadataHash = toHex("test-metadata-hash", { size: 32 });
const nftMetadataHash = toHex("test-nft-metadata-hash", { size: 32 });
let nftCollectionAddress: Hex;
let ipId: Hex;
let ipIdA: Hex;
let licenseTermsId: bigint;

const terms = {
    transferable: true,
    royaltyPolicy: zeroAddress as Hex,
    defaultMintingFee: 0,
    expiration: 0,
    commercialUse: false,
    commercialAttribution: false,
    commercializerChecker: zeroAddress as Hex,
    commercializerCheckerData: zeroAddress as Hex,
    commercialRevShare: 0,
    commercialRevCeiling: 0,
    derivativesAllowed: true,
    derivativesAttribution: true,
    derivativesApproval: false,
    derivativesReciprocal: true,
    derivativeRevCeiling: 0,
    currency: zeroAddress as Hex,
    uri: "",
};

describe('Test script to register IPAs', function () {
    // before("Create NFT collection",async function () {
    //     const response = await expect(
    //         createNFTCollection("A", "sdk-e2e-test", "test", true, true, accountA.address, "contract-uri", true)
    //     ).to.not.be.rejected;

    //     expect(response.txHash).to.be.a("string").and.not.empty;
    //     expect(response.spgNftContract).to.be.a("string").and.not.empty;

    //     nftCollectionAddress = response.spgNftContract;
    // });

    describe('Test ipAsset.registerDerivativeIp Function', async function () {
        // it("Register an IP asset with commercial remix license terms and all optional parameters", async function () {
        //     const testTerms = terms;
        //     testTerms.commercialUse = true;
        //     testTerms.royaltyPolicy = royaltyPolicyLAPAddress;
        //     testTerms.currency = mockERC20Address;
        //     testTerms.defaultMintingFee = 10;
        //     testTerms.commercialRevShare = 10;

        //     console.log(testTerms);

        //     const metadata = {
        //         "title":"Rolex",
        //         "description":"Test",
        //         "ipType":"Brand",
        //         "media_url":"https://coffee-accused-lemming-213.mypinata.cloud/ipfs/bafkreid5gk7c75i6u5gtfqfotgbhbu2c2hvvvpj4xv62es4tbbanbutmd4",
        //         "media_hash":"7D32BE2FF51EA74D32C0AE998270D342D1EB5ABD3CBD7DA24B930840D0D26C1F",
        //         "tags":[
        //           "Watch",
        //           "Rolex"
        //         ],
        //         "creators":[
        //           {
        //             "name":"Test1",
        //             "address":"0x3a64F54a05EA5e3F0e33d86A199F191fe7c5F78A",
        //             "contributionPercent":100,
        //             "socialMedia":[
        //               {
        //                 "platform":"Twitter",
        //                 "url":"https://twitter.com/storyprotocol"
        //               },
        //               {
        //                 "platform":"Telegram",
        //                 "url":"https://t.me/StoryAnnouncements"
        //               },
        //               {
        //                 "platform":"Website",
        //                 "url":"https://story.foundation"
        //               },
        //               {
        //                 "platform":"Discord",
        //                 "url":"https://discord.gg/storyprotocol"
        //               },
        //               {
        //                 "platform":"YouTube",
        //                 "url":"https://youtube.com/@storyFDN"
        //               }
        //             ]
        //           }
        //         ]
        //     }

        //     const metadataHash = toHex("Dooldead", { size: 32 });
            
        //     const metadataURI = "https://coffee-accused-lemming-213.mypinata.cloud/ipfs/bafkreiepcxorzxbmmyedislhf6nd63umqa6n7ixj5c7wyobl4uwhtauh2u";
            

        //     const response = await expect(
        //         // mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, testTerms, true, metadataURI, metadataHash, nftMetadataURI, nftMetadataHash, accountA.address)
        //         mintAndRegisterIpAssetWithPilTerms("A", nftCollectionAddress, [testTerms], true, metadataURI, undefined, undefined, undefined, accountA.address)
        //     ).to.not.be.rejected;

        //     ipIdA = response.ipId;

        //     expect(response.txHash).to.be.a("string").and.not.empty;
        //     expect(response.ipId).to.be.a("string").and.not.empty;
        //     expect(response.tokenId).to.be.a("bigint").and.to.be.ok;
        //     expect(response.licenseTermsIds[0]).to.be.a("bigint").and.to.be.ok;
            
        //     licenseTermsId = response.licenseTermsIds[0];

        // });

        // it("Attach License Terms", async function () {
        //     // const ipId = "0xf021FE45bd6838AE0cF9F54a6C93DB3d82BdE0Df" as Hex; 
        //     const response = await expect(
        //         attachLicenseTerms("A", ipId, comUseLicenseTermsId2, true)
        //     ).not.to.be.rejectedWith(Error);
        // });

        // it("Register a derivative IP asset fail as no license terms attached", async function () {
        //   const ipIdA = "0x5d66104AeF6c2876A547643514c047fb74c471eD" as Hex;
        //   const ipIdB = "0x83C5EeeAC3D4B176F1B8128e86DDC0F72C0dc6b9" as Hex;

        //   const respone = await expect(
        //     registerDerivative("A", ipIdB, [ipIdA], [159n], true)
        //   ).not.to.be.rejectedWith(Error);
        // });

        
        it("Register a derivative IP asset success", async function () {

          const IP = [
            '0xAa8bd0e74665355811589044B5F7e86FA03DaB0f',
            '0x5BA350B25D96Ea27B1218da55391411c4100E8b4',
            '0xE0303dc88cDC302A52EE1760857bE2270F57b529',
            '0xC84D9eA8FB343d100bA53ba7DCE04c98ab45e3C8',
            '0x525ecB5C9fC9094673a643A750D93bF86Da270EC',
            '0xEC365eFda16b3248E721F1067B0EF45D6AaDd7e7'
          ]
          const ipIdA = "0x525ecB5C9fC9094673a643A750D93bF86Da270EC" as Hex;
          const nftCollectionAddress = "0x201871dDC4596cAC35c90031C58253C1255f2CC4" as Hex;
          const licenseTemplate = licenseTemplateAddress;

          const metadataURI = "https://coffee-accused-lemming-213.mypinata.cloud/ipfs/bafkreih6k4ml36pc6ghb34ahzixz74pi4zpjcumdyhotazijh26lckzjiu";

          // const tokenIdB = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
          // expect(tokenIdB).to.be.a("string").and.not.empty;

          // const registerRootIPResponse = await expect(
          //   registerIpAsset("A", nftCollectionAddress, tokenIdB, true)
          // ).to.not.be.rejected;
      
          // expect(registerRootIPResponse.txHash).to.be.a("string");
          // expect(registerRootIPResponse.txHash).not.empty;
          // expect(registerRootIPResponse.ipId).to.be.exist;

          // const ipIdB = registerRootIPResponse.ipId;
          const ipIdB = "0xEC365eFda16b3248E721F1067B0EF45D6AaDd7e7" as Hex;
          
          const response = await expect(
              registerDerivative("A", ipIdB, [ipIdA], [7n], true)
          ).to.not.be.rejectedWith(Error);

          expect(response.txHash).to.be.a("string").and.not.empty;
        });
              
        it("Register a derivative IP asset with all optional parameters", async function () {
          const ipIdA = "0x4c007f76C0C0D31A0fAb6A747B9C3dAc794778c8" as Hex;
          const nftCollectionAddress = "0x201871dDC4596cAC35c90031C58253C1255f2CC4" as Hex;
          const licenseTemplate = licenseTemplateAddress;
          const deadline = await(getBlockTimestamp()) + 1000n;
          const metadataURI = "https://coffee-accused-lemming-213.mypinata.cloud/ipfs/bafkreih6k4ml36pc6ghb34ahzixz74pi4zpjcumdyhotazijh26lckzjiu";

          const tokenIdB = await mintNFTWithRetry(privateKeyA, nftCollectionAddress);
          expect(tokenIdB).to.be.a("string").and.not.empty;

          const licenseTermsId = 159n;

          const response = await expect(
            registerDerivativeIp("A", nftCollectionAddress, tokenIdB, [ipIdA], [licenseTermsId], true, licenseTemplate, metadataURI, undefined, undefined, undefined, deadline)
          ).to.not.be.rejectedWith(Error);

          expect(response.txHash).to.be.a("string").and.not.empty;
          expect(response.ipId).to.be.a("string").and.not.empty;
      });
    });
});
