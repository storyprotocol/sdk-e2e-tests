import { privateKeyA, privateKeyB, privateKeyC, accountA, accountB, accountC, nftContractAddress } from '../../config/config'
import { mintNFTWithRetry } from '../../utils/utils'
import { registerIpAsset, attachLicenseTerms, mintLicenseTokens, registerDerivative, registerDerivativeWithLicenseTokens } from '../../utils/sdkUtils'
import { expect } from 'chai'

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Hex } from 'viem';
import { comUseLicenseTermsId1 } from '../setup';

let tokenIdA: string;
let tokenIdB: string;
let tokenIdC: string;
let ipIdA: Hex;
let ipIdB: Hex;
let ipIdC: Hex;
let licenseTokenIdA: string;
let licenseTokenIdB: string;

const waitForTransaction: boolean = true;

describe("SDK E2E Test - Register Derivative IP Asset with Commercial Use PIL", function () {
    describe("[smoke]Register a derivative IP asset with/without license tokens", async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            if (tokenIdA === '') {
                throw new Error('Unable to mint NFT');
            };
            expect(tokenIdA).not.empty;
        });

        step("Wallet A register an IP Asset with tokenIdA and get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;
        });

        step("Wallet A attach comUseLicenseTermsId1(commercial use PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Wallet A mint a license token with the receiverAddress set as Wallet B, get a licenseTokenId (licenseTokenIdA)", async function () {
            const response = await expect(
                mintLicenseTokens("A", ipIdA, comUseLicenseTermsId1, 2, accountB.address, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTokenId).to.be.a("bigint").and.to.be.ok;

            licenseTokenIdA = response.licenseTokenId;
        });

        step("Mint a NFT to Wallet B and get a tokenId (tokenIdB)", async function () {
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            if (tokenIdB === '') {
                throw new Error('Unable to mint NFT');
            };
            expect(tokenIdB).not.empty;
        });

        step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdB)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdB = response.ipId;
        });

        step("Wallet B can register a derivative IP asset with licenseTokenIdA", async function () {
            const response = await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenIdA], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Mint a NFT to WalletC and get a tokenId(tokenIdC)", async function () {
            tokenIdC = await mintNFTWithRetry(privateKeyC);
            if (tokenIdC === '') {
                throw new Error('Unable to mint NFT');
            }
            expect(tokenIdC).not.empty;
        });

        step("Wallet C register an IP Asset with tokenIdC and get an ipId (ipIdC)", async function () {
            const response = await expect(
                registerIpAsset("C", nftContractAddress, tokenIdC, waitForTransaction)
            ).to.not.be.rejected;
            
            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdC = response.ipId;
        })

        // licenseTokenIdA set the Wallet B's address as receiverAddress, Wallet C can NOT register a derivative IP asset with licenseTokenIdA
        step("Wallet C can NOT register a derivative IP asset with licenseTokenIdA", async function () {
            const response = await expect(
                registerDerivativeWithLicenseTokens("C", ipIdC, [licenseTokenIdA], waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"ownerOf\" reverted.");
        });

        step("Wallet C can register a derivative IP asset without licenseTokenId", async function () {
            const response = await expect(
                registerDerivative("C", ipIdC, [ipIdA], [comUseLicenseTermsId1], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });
    });

    describe('Register a derivative IP asset with multiple parent IP assets', async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            if (tokenIdA === "") {
                throw new Error("Unable to mint NFT");
            };
            expect(tokenIdA).not.empty;
        });

        step("Wallet A register an IP Asset with tokenIdA and get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;
        });

        step("Wallet A attach comUseLicenseTermsId1(commercial use PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Mint a NFT to WalletB, get a tokenId (tokenidB)", async function () {
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            if (tokenIdB === '') {
                throw new Error('Unable to mint NFT');
            };
            expect(tokenIdB).not.empty;
        });

        step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdB)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdB = response.ipId;
        });

        step("Wallet B attach comUseLicenseTermsId1(commercial use PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("B", ipIdB, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Mint a NFT to WalletC, get a tokenId (tokenidC)", async function () {
            tokenIdC = await mintNFTWithRetry(privateKeyC);
            if (tokenIdC === '') {
                throw new Error('Unable to mint NFT');
            };
            expect(tokenIdC).not.empty;
        });

        step("Wallet C register an IP Asset with tokenIdC and get an ipId (ipIdC)", async function () {
            const response = await expect(
                registerIpAsset("C", nftContractAddress, tokenIdC, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdC = response.ipId;
        });

        step("Wallet C can register a derivative IP asset with multiple parent IP assets (ipIdA, ipIdB)", async function () {
            const response = await expect(
                registerDerivative("C", ipIdC, [ipIdA, ipIdB], [comUseLicenseTermsId1, comUseLicenseTermsId1], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;                
            });
    });

    describe("Register a derivative IP assets with multiple license tokens", async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            if (tokenIdA === "") {
                throw new Error("Unable to mint NFT");
            };
            expect(tokenIdA).not.empty;
        });

        step("Wallet A register an IP Asset with tokenIdA, get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;
        });

        step("Wallet A attach comUseLicenseTermsId1(commercial use PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Wallet A mint a license token with the receiverAddress set as Wallet B, get a licenseId (licenseTokenIdA)", async function () {
            const response = await expect(
                mintLicenseTokens("A", ipIdA, comUseLicenseTermsId1, 2, accountC.address, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTokenId).to.be.a("bigint").and.to.be.ok;

            licenseTokenIdA = response.licenseTokenId;
        });

        step("Mint a NFT to WalletB, get a tokenId (tokenIdB)", async function () {
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            if (tokenIdB === "") {
                throw new Error("Unable to mint NFT");
            }
            expect(tokenIdB).not.empty;
        });

        step("Wallet B register an IP Asset with tokenIdB, get an ipId (ipIdB)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdB = response.ipId;
        });

        step("Wallet B attach comUseLicenseTermsId1(commercial use PIL) to ipIdB", async function () {
            const response = await expect(
                attachLicenseTerms("B", ipIdB, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Wallet B mint a license token with the receiverAddress set as Wallet C, get a licenseTokenId (licenseTokenIdB)", async function () {
            const response = await expect(
                mintLicenseTokens("B", ipIdB, comUseLicenseTermsId1, 2, accountC.address, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTokenId).to.be.a("bigint").and.to.be.ok;

            licenseTokenIdB = response.licenseTokenId;
        });

        step("Mint a NFT to WalletC, get a tokenId (tokenIdC)", async function () {
            tokenIdC = await mintNFTWithRetry(privateKeyC);
            if (tokenIdC === "") {
                throw new Error("Unable to mint NFT");
            }
            expect(tokenIdC).not.empty;
        });

        step("Wallet C register an IP Asset with tokenIdC, get an ipId (ipIdC)", async function () {
            const response = await expect(
                registerIpAsset("C", nftContractAddress, tokenIdC, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdC = response.ipId;
        });

        step("Wallet C can register a derivative IP asset with multiple license tokens (licenseTokenIdA, licenseTokenIdB)", async function () {
            const response = await expect(
                registerDerivativeWithLicenseTokens("C", ipIdC, [licenseTokenIdA, licenseTokenIdB], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });
    });

    describe("Register a derivative IP assets with multiple license tokens, the sender is not licensee", async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            if (tokenIdA === "") {
                throw new Error("Unable to mint NFT");
            };
            expect(tokenIdA).not.empty;
        });

        step("Wallet A register an IP Asset with tokenIdA, get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;
        });

        step("Wallet A attach comUseLicenseTermsId1(commercial use PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Wallet A mint a license token with the receiverAddress set as Wallet B, get a licenseId (licenseTokenIdA)", async function () {
            const response = await expect(
                mintLicenseTokens("A", ipIdA, comUseLicenseTermsId1, 2, accountB.address, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTokenId).to.be.a("bigint").and.to.be.ok;

            licenseTokenIdA = response.licenseTokenId;
        });

        step("Mint a NFT to WalletB, get a tokenId (tokenIdB)", async function () {
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            if (tokenIdB === "") {
                throw new Error("Unable to mint NFT");
            }
            expect(tokenIdB).not.empty;
        });

        step("Wallet B register an IP Asset with tokenIdB, get an ipId (ipIdB)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdB = response.ipId;
        });

        step("Wallet B attach comUseLicenseTermsId1(commercial use PIL) to ipIdB", async function () {
            const response = await expect(
                attachLicenseTerms("B", ipIdB, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Wallet B mint a license token with the receiverAddress set as Wallet C, get a licenseTokenId (licenseTokenIdB)", async function () {
            const response = await expect(
                mintLicenseTokens("B", ipIdB, comUseLicenseTermsId1, 2, accountC.address, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTokenId).to.be.a("bigint").and.to.be.ok;

            licenseTokenIdB = response.licenseTokenId;
        });

        step("Mint a NFT to WalletC, get a tokenId (tokenIdC)", async function () {
            tokenIdC = await mintNFTWithRetry(privateKeyC);
            if (tokenIdC === "") {
                throw new Error("Unable to mint NFT");
            }
            expect(tokenIdC).not.empty;
        });

        step("Wallet C register an IP Asset with tokenIdC, get an ipId (ipIdC)", async function () {
            const response = await expect(
                registerIpAsset("C", nftContractAddress, tokenIdC, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdC = response.ipId;
        });

        // Wallet C is not the licensee of licenseTokenIdA
        step("Wallet C can NOT register derivative IP asset with licenseTokenIdA", async function () {
            const response = await expect(
                registerDerivativeWithLicenseTokens("C", ipIdC, [licenseTokenIdA, licenseTokenIdB], waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted with the following signature:");
        });
    });

    describe("Register multiple derivative IP assets with license token, registered amount larger than mint amount of license token", async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            if (tokenIdA === "") {
                throw new Error("Unable to mint NFT");
            }
            expect(tokenIdA).not.empty;
        });

        step("Wallet A register an IP Asset with tokenIdA and get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;
        });

        step("Wallet A attach comUseLicenseTermsId1(commercial use PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Wallet A mint a license token with ipIdA and get a licenseTokenId (licenseTokenIdA)", async function () {
            const response = await expect(
                mintLicenseTokens("A", ipIdA, comUseLicenseTermsId1, 1, accountB.address, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTokenId).to.be.a("bigint").and.to.be.ok;

            licenseTokenIdA = response.licenseTokenId;
        });

        step("Mint a NFT to WalletB and get a tokenId (tokenIdB)", async function () {
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            if (tokenIdB === "") {
                throw new Error("Unable to mint NFT");
            }
            expect(tokenIdB).not.empty;
        });

        step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdB)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdB = response.ipId;
        });

        step("Wallet B can register a derivative IP asset with licenseTokenIdA", async function () {
            const response = await expect(
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenIdA], waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Mint a NFT to WalletB and get a tokenId (tokenIdB)", async function () {
            tokenIdC = await mintNFTWithRetry(privateKeyB);
            if (tokenIdC === "") {
                throw new Error("Unable to mint NFT");
            }
            expect(tokenIdC).not.empty;
        });

        step("Wallet B register a root IP Asset with tokenIdC, get an ipId (ipIdC)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdC, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdC = response.ipId;
        });

        step("Wallet B can NOT register a derivative IP asset with licenseTokenIdA, no more license token", async function () {
            const response = await expect(
                registerDerivativeWithLicenseTokens("B", ipIdC, [licenseTokenIdA], waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"ownerOf\" reverted.");
        });
    });

    describe("Register derivative IP asset with an IP that already has license", async function () {
        step("Mint a NFT to Wallet A and get a tokenId (tokenIdA)", async function () {
            tokenIdA = await mintNFTWithRetry(privateKeyA);
            if (tokenIdA === "") {
                throw new Error("Unable to mint NFT");
            }
            expect(tokenIdA).not.empty;
        });

        step("Wallet A register an IP Asset with tokenIdA and get an ipId (ipIdA)", async function () {
            const response = await expect(
                registerIpAsset("A", nftContractAddress, tokenIdA, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdA = response.ipId;
        });

        step("Wallet A attach comUseLicenseTermsId1(commercial use PIL) to ipIdA", async function () {
            const response = await expect(
                attachLicenseTerms("A", ipIdA, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Wallet A mint a license token with ipIdA and get a licenseTokenId (licenseTokenIdA)", async function () {
            const response = await expect(
                mintLicenseTokens("A", ipIdA, comUseLicenseTermsId1, 1, accountB.address, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTokenId).to.be.a("bigint").and.to.be.ok;

            licenseTokenIdA = response.licenseTokenId;
        });

        step("Mint a NFT to WalletB and get a tokenId (tokenIdB)", async function () {
            tokenIdB = await mintNFTWithRetry(privateKeyB);
            if (tokenIdB === "") {
                throw new Error("Unable to mint NFT");
            }
            expect(tokenIdB).not.empty;
        });

        step("Wallet B register an IP Asset with tokenIdB and get an ipId (ipIdB)", async function () {
            const response = await expect(
                registerIpAsset("B", nftContractAddress, tokenIdB, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.ipId).to.be.a("string").and.not.empty;

            ipIdB = response.ipId;
        });

        step("Wallet B attach comUseLicenseTermsId1(commercial use PIL) to ipIdB", async function () {
            const response = await expect(
                attachLicenseTerms("B", ipIdB, comUseLicenseTermsId1, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
        });

        step("Wallet B mint a license token with ipIdB and get a licenseTokenId (licenseTokenIdB)", async function () {
            const response = await expect(
                mintLicenseTokens("B", ipIdB, comUseLicenseTermsId1, 1, accountA.address, waitForTransaction)
            ).to.not.be.rejected;

            expect(response.txHash).to.be.a("string").and.not.empty;
            expect(response.licenseTokenId).to.be.a("bigint").and.to.be.ok;

            licenseTokenIdB = response.licenseTokenId;
        });

        step("Wallet B can NOT register a derivative IP asset with ipIdB, LicenseRegistry__DerivativeIpAlreadyHasLicense(address)", async function () {
            const response = await expect(               
                registerDerivativeWithLicenseTokens("B", ipIdB, [licenseTokenIdA], waitForTransaction)
            ).to.be.rejectedWith("Failed to register derivative with license tokens: The contract function \"registerDerivativeWithLicenseTokens\" reverted with the following signature:", "0x650aa4f5");
        });
    });
});
