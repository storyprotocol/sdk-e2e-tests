import { Hex, Address, encodeFunctionData } from "viem";
import { clientA, clientB, clientC, } from '../config/config';
import { PIL_TYPE } from "@story-protocol/core-sdk";
import { processResponse } from "./utils";

export const storyClients = {
    A: clientA,
    B: clientB,
    C: clientC,
};

function getStoryClient(wallet: keyof typeof storyClients) {
    return storyClients[wallet];
};

interface PolicyOptions {
    [key: string]: any;
};

function formatValue(value: any): string {
    if (typeof value === 'bigint') {
      return value.toString() + 'n';
    }
    return String(value);
};

export const registerIpAsset = async function (
    wallet: keyof typeof storyClients, 
    nftContractAddress: Address, 
    tokenId: string | number | bigint, 
    waitForTransaction: boolean | undefined,
    metadataURI?: string | undefined,
    metadataHash?: `0x${string}` | undefined,
    nftMetadataHash?: `0x${string}` | undefined,
    deadline?: string | number | bigint | undefined
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.register({
        nftContract: nftContractAddress,
        tokenId: tokenId,
        metadata: {
            metadataURI: metadataURI,
            metadataHash: metadataHash,
            nftMetadataHash: nftMetadataHash
        },
        deadline: deadline,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });
    console.log(JSON.stringify(response));
    return response;
};

export const registerDerivative = async function (
    wallet: keyof typeof storyClients, 
    childIpId: Hex, 
    parentIpIds: `0x${string}`[], 
    licenseTermsIds: string[] | bigint[] | number[], 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.registerDerivative({
        childIpId: childIpId,
        parentIpIds: parentIpIds,
        licenseTermsIds: licenseTermsIds,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });
    console.log(JSON.stringify(response));
    return response;
};

export const registerDerivativeIp = async function (
    wallet: keyof typeof storyClients, 
    nftContract: Hex, 
    tokenId: string | number | bigint, 
    parentIpIds: `0x${string}`[], 
    licenseTermsIds: string[] | bigint[] | number[],
    waitForTransaction?: boolean,
    licenseTemplate?: `0x${string}` | undefined,
    metadataURI?: string | undefined,
    metadataHash?: `0x${string}` | undefined,
    nftMetadataHash?: `0x${string}` | undefined,
    deadline?: string | number | bigint | undefined
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.registerDerivativeIp({
        nftContract: nftContract,
        tokenId: tokenId,
        derivData: {
            parentIpIds: parentIpIds,
            licenseTermsIds: licenseTermsIds,
            licenseTemplate: licenseTemplate
        },
        metadata: {
            metadataURI: metadataURI,
            metadataHash: metadataHash,
            nftMetadataHash: nftMetadataHash,
        },
        deadline: deadline,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });
    console.log(JSON.stringify(response));
    return response;
};

export const registerDerivativeWithLicenseTokens = async function (
    wallet: keyof typeof storyClients, 
    childIpId: Address, 
    licenseTokenIds: string[] | bigint[] | number[], 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.registerDerivativeWithLicenseTokens({
        childIpId: childIpId,
        licenseTokenIds: licenseTokenIds,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });
    console.log(JSON.stringify(response));
    return response;
};

export const mintAndRegisterIpAssetWithPilTerms = async function (
    wallet: keyof typeof storyClients, 
    nftContract: Address, 
    pilType: PIL_TYPE, 
    waitForTransaction?: boolean, 
    metadataURI?: string | undefined,
    metadataHash?: `0x${string}` | undefined,
    nftMetadataHash?: `0x${string}` | undefined,
    recipient?: `0x${string}` | undefined,
    mintingFee?: string | undefined,
    commercialRevShare?: number | undefined,
    currency?: `0x${string}` | undefined
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        nftContract: nftContract,
        pilType: pilType,
        metadata: {
            metadataURI: metadataURI,
            metadataHash: metadataHash,
            nftMetadataHash: nftMetadataHash,
        },
        recipient: recipient,
        mintingFee: mintingFee,
        commercialRevShare: commercialRevShare,
        currency: currency,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });

    const responseJson = processResponse(response);
    console.log(JSON.stringify(responseJson));
    return response;
};

export const registerIpAndAttachPilTerms = async function (
    wallet: keyof typeof storyClients, 
    nftContract: Address, 
    tokenId: string | number | bigint,
    pilType: PIL_TYPE, 
    waitForTransaction?: boolean, 
    metadataURI?: string | undefined,
    metadataHash?: `0x${string}` | undefined,
    nftMetadataHash?: `0x${string}` | undefined,
    deadline?: string | number | bigint | undefined,
    mintingFee?: string | undefined,
    commercialRevShare?: number | undefined,
    currency?: `0x${string}` | undefined
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.registerIpAndAttachPilTerms({
        nftContract: nftContract,
        tokenId: tokenId,
        pilType: pilType,
        metadata: {
            metadataURI: metadataURI,
            metadataHash: metadataHash,
            nftMetadataHash: nftMetadataHash,
        },
        deadline: deadline,
        mintingFee: mintingFee,
        commercialRevShare: commercialRevShare,
        currency: currency,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });

    const responseJson = processResponse(response);
    console.log(JSON.stringify(responseJson));
    return response;
};

export const registerNonComSocialRemixingPIL = async function (
    wallet: keyof typeof storyClients, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.registerNonComSocialRemixingPIL({
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    });

    const responseJson = processResponse(response);
    console.log(JSON.stringify(responseJson));
    return response;
};

export const registerCommercialRemixPIL = async function (
    wallet: keyof typeof storyClients, 
    mintingFee: string, 
    commercialRevShare: number, 
    currency: Hex, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.registerCommercialRemixPIL({
        mintingFee: mintingFee,
        commercialRevShare: commercialRevShare,
        currency: currency,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });

    const responseJson = processResponse(response);
    console.log(JSON.stringify(responseJson));
    return response;
};

export const registerCommercialUsePIL = async function (
    wallet: keyof typeof storyClients, 
    mintingFee: string | number | bigint, 
    currency: `0x${string}`, 
    waitForTransaction?: boolean | undefined
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.registerCommercialUsePIL({
        mintingFee: mintingFee,
        currency: currency,
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    });

    const responseJson = processResponse(response);
    console.log(JSON.stringify(responseJson));
    return response;
};

export const attachLicenseTerms = async function (
    wallet: keyof typeof storyClients,
    ipId: Address, 
    licenseTermsId: string | number | bigint, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseTermsId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });
    console.log(JSON.stringify(response));
    return response;
};

export const getLicenseTerms = async function (
    wallet: keyof typeof storyClients, 
    selectedLicenseTermsId: string | number | bigint
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.getLicenseTerms(selectedLicenseTermsId);

    const responseJson: { [key: string]: string | bigint } = {};
    Object.entries(response["terms"]).forEach(([key, value]) => {
      if (typeof value === "bigint") {
        responseJson[key] = value.toString() + 'n';
      } else {
        responseJson[key] = value as string;
      }
    });
    console.log(JSON.stringify(responseJson));
    
    return response;
};

export const mintLicenseTokens = async function (
    wallet: keyof typeof storyClients, 
    licensorIpId: Address, 
    licenseTermsId: string | number | bigint, 
    amount: number, 
    receiver: Address, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.mintLicenseTokens({
        licensorIpId: licensorIpId,
        licenseTermsId: licenseTermsId,
        amount: amount,
        receiver: receiver,
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    });

    console.log(response);
    // const responseJson = processResponse(response);
    // console.log(JSON.stringify(responseJson));
    return response;
};

export const setPermission = async function (
    wallet: keyof typeof storyClients, 
    ipId: Hex, 
    signer: Hex, 
    to: Hex, 
    permission: number, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.permission.setPermission({
        ipId: ipId,
        signer: signer,
        to: to,
        permission: permission,
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    })
    console.log(JSON.stringify(response));
    return response;
};

export const royaltySnapshot = async function (
    wallet: keyof typeof storyClients, 
    royaltyVaultIpId: Address, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.snapshot({
        royaltyVaultIpId: royaltyVaultIpId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });

    const responseJson = processResponse(response);
    console.log(JSON.stringify(responseJson));
    return response;
};

export const payRoyaltyOnBehalf = async function (
    wallet: keyof typeof storyClients, 
    receiverIpId: Hex, 
    payerIpId: Hex, 
    token: Address, 
    amount: string | number | bigint, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.payRoyaltyOnBehalf({
        receiverIpId: receiverIpId,
        payerIpId: payerIpId,
        token: token,
        amount: amount,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    })
    console.log(JSON.stringify(response));
    return response;
};

export const collectRoyaltyTokens = async function (
    wallet: keyof typeof storyClients, 
    parentIpId: Hex, 
    royaltyVaultIpId: Hex, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.collectRoyaltyTokens({
        parentIpId: parentIpId,
        royaltyVaultIpId: royaltyVaultIpId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });

    const responseJson = processResponse(response);
    console.log(JSON.stringify(responseJson));
    return response;
};

export const royaltyClaimableRevenue = async function (
    wallet: keyof typeof storyClients, 
    royaltyVaultIpId: Address, 
    account: Address, 
    snapshotId: string | number | bigint, 
    token: Address, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.claimableRevenue({
        royaltyVaultIpId: royaltyVaultIpId,
        account: account,
        snapshotId: snapshotId,
        token: token
    })

    console.log(response);
    return response;
};

export const royaltyClaimRevenue = async function (
    wallet: keyof typeof storyClients, 
    snapshotIds:string[] | bigint[] | number[], 
    royaltyVaultIpId: Address,
    token: Address,
    account?: Address | undefined, 
    waitForTransaction?: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.claimRevenue({
        snapshotIds: snapshotIds,
        royaltyVaultIpId: royaltyVaultIpId,
        account: account,
        token: token,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });

    const responseJson = processResponse(response);
    console.log(JSON.stringify(responseJson));
    return response;
};

export const getRoyaltyVaultAddress = async function (
    wallet: keyof typeof storyClients, 
    royaltyVaultIpId: Hex
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.getRoyaltyVaultAddress(royaltyVaultIpId);

    console.log(response);    
    return response;
};

export const raiseDispute = async function (
    wallet: keyof typeof storyClients, 
    targetIpId: Hex, 
    arbitrationPolicy: Hex, 
    linkToDisputeEvidence: string, 
    targetTag: string, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.dispute.raiseDispute({
        targetIpId: targetIpId,
        arbitrationPolicy: arbitrationPolicy,
        linkToDisputeEvidence: linkToDisputeEvidence,
        targetTag: targetTag,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });

    const responseJson = processResponse(response);
    console.log(JSON.stringify(responseJson));
    return response;
};

export const cancelDispute = async function (
    wallet: keyof typeof storyClients, 
    disputeId: string | number | bigint, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.dispute.cancelDispute({
        disputeId: disputeId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });
    console.log(JSON.stringify(response));
    return response;
};

export const resolveDispute = async function (
    wallet: keyof typeof storyClients, 
    disputeId: string | number | bigint, 
    data: Hex, 
    waitForTransaction: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.dispute.resolveDispute({
        disputeId: disputeId,
        data: data,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });
    console.log(JSON.stringify(response));
    return response;
};

export const createNFTCollection = async function (
    wallet: keyof typeof storyClients, 
    name: string, 
    symbol: string, 
    waitForTransaction: boolean,
    options?: { [key: string]: any }
) {
    const storyClient = getStoryClient(wallet);
    storyClient.nftClient.spgClient
    const response = await storyClient.nftClient.createNFTCollection({
        name: name,
        symbol: symbol,
        txOptions: {
            waitForTransaction: waitForTransaction
        },
        ...options
    });
    console.log(JSON.stringify(response));
    return response;
};


export const ipAccountExecute = async function (
    wallet: keyof typeof storyClients, 
    toAddress: Address, 
    value: number, 
    ipId: Address,
    data: Address,
    waitForTransaction?: boolean
) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAccount.execute({
        to: toAddress,
        value: value,
        ipId: ipId,
        data: data,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });
    console.log(JSON.stringify(response));
    return response;
};

