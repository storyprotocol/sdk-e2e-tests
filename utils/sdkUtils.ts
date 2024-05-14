import { Hex, Address } from "viem";
import { clientA, clientB, clientC, } from '../config/config'

const storyClients = {
    A: clientA,
    B: clientB,
    C: clientC,
};

function getStoryClient(wallet: keyof typeof storyClients) {
    return storyClients[wallet];
}

interface PolicyOptions {
    [key: string]: any;
}

function formatValue(value: any): string {
    if (typeof value === 'bigint') {
      return value.toString() + 'n';
    }
    return String(value);
};

export const registerIpAsset = async function (wallet: keyof typeof storyClients, nftContractAddress: Address, tokenId: string | number | bigint, waitForTransaction: boolean | undefined) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.register({
        nftContract: nftContractAddress,
        tokenId: tokenId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    })
    console.log(JSON.stringify(response))
    return response
}

export const registerDerivative = async function (wallet: keyof typeof storyClients, childIpId: Hex, parentIpIds: `0x${string}`[], licenseTermsIds: string[] | bigint[] | number[], waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.registerDerivative({
        childIpId: childIpId,
        parentIpIds: parentIpIds,
        licenseTermsIds: licenseTermsIds,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    })
    console.log(JSON.stringify(response))
    return response
}

export const registerDerivativeWithLicenseTokens = async function (wallet: keyof typeof storyClients, childIpId: Address, licenseTokenIds: string[] | bigint[] | number[], waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.registerDerivativeWithLicenseTokens({
        childIpId: childIpId,
        licenseTokenIds: licenseTokenIds,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    })
    console.log(JSON.stringify(response))
    return response
}

export const registerNonComSocialRemixingPIL = async function (wallet: keyof typeof storyClients, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.registerNonComSocialRemixingPIL({
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    });

    const responseJson: { [key: string]: string | bigint } = {};
    Object.entries(response).forEach(([key, value]) => {
        if (typeof value === "bigint") {
            responseJson[key] = value.toString() + 'n';
        } else {
            responseJson[key] = value;
        }
    });

    console.log(JSON.stringify(responseJson));
    return response
}

export const registerCommercialRemixPIL = async function (wallet: keyof typeof storyClients, mintingFee: string, commercialRevShare: number, currency: Hex, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.registerCommercialRemixPIL({
        mintingFee: mintingFee,
        commercialRevShare: commercialRevShare,
        currency: currency,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });

    const responseJson: { [key: string]: string | bigint } = {};
    Object.entries(response).forEach(([key, value]) => {
        if (typeof value === "bigint") {
            responseJson[key] = value.toString() + 'n';
        } else {
            responseJson[key] = value;
        }
    });

    console.log(JSON.stringify(responseJson));
    return response;
}

export const registerCommercialUsePIL = async function (wallet: keyof typeof storyClients, mintingFee: string | number | bigint, currency: `0x${string}`, waitForTransaction?: boolean | undefined) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.registerCommercialUsePIL({
        mintingFee: mintingFee,
        currency: currency,
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    });

    const responseJson: { [key: string]: string | bigint } = {};
    Object.entries(response).forEach(([key, value]) => {
        if (typeof value === "bigint") {
            responseJson[key] = value.toString() + 'n';
        } else {
            responseJson[key] = value;
        }
    });

    console.log(JSON.stringify(responseJson));
    return response;
}

export const attachLicenseTerms = async function (wallet: keyof typeof storyClients, ipId: Address, licenseTermsId: string | number | bigint, waitForTransaction: boolean) {
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
}

export const getLicenseTerms = async function (wallet: keyof typeof storyClients, selectedLicenseTermsId: string | number | bigint) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.getLicenseTerms(selectedLicenseTermsId);

    const responseJson: { [key: string]: any } = {
        terms: {} as { [key: string]: any }
    };

    Object.entries(response.terms).forEach(([key, value]) => {
        if (typeof value === "bigint") {
            responseJson.terms[key] = value.toString() + 'n';
        } else {
            responseJson.terms[key] = value;
        }
    });

    console.log(JSON.stringify(responseJson));
    return response;
}

export const mintLicenseTokens = async function (wallet: keyof typeof storyClients, licensorIpId: Address, licenseTermsId: string | number | bigint, amount: number, receiver: Address, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.mintLicenseTokens({
        licensorIpId: licensorIpId,
        licenseTermsId: licenseTermsId,
        amount: amount,
        receiver: receiver,
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    })

    const responseJson: { [key: string]: string | bigint } = {};
    Object.entries(response).forEach(([key, value]) => {
        if (typeof value === "bigint") {
            responseJson[key] = value.toString() + 'n';
        } else {
            responseJson[key] = value;
        }
    });

    console.log(JSON.stringify(responseJson));
    return response;
}

export const setPermission = async function (wallet: keyof typeof storyClients, ipId: Hex, signer: Hex, to: Hex, permission: number, waitForTransaction: boolean) {
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
}

export const royaltySnapshot = async function (wallet: keyof typeof storyClients, royaltyVaultIpId: Address, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.snapshot({
        royaltyVaultIpId: royaltyVaultIpId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });

    const responseJson: { [key: string]: string | bigint } = {};
    Object.entries(response).forEach(([key, value]) => {
        if (typeof value === "bigint") {
            responseJson[key] = value.toString() + 'n';
        } else {
            responseJson[key] = value;
        }
    });

    console.log(JSON.stringify(responseJson));
    return response;
}

export const payRoyaltyOnBehalf = async function (wallet: keyof typeof storyClients, receiverIpId: Hex, payerIpId: Hex, token: Address, amount: string, waitForTransaction: boolean) {
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
}

export const collectRoyaltyTokens = async function (wallet: keyof typeof storyClients, parentIpId: Hex, royaltyVaultIpId: Hex, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.collectRoyaltyTokens({
        parentIpId: parentIpId,
        royaltyVaultIpId: royaltyVaultIpId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });

    const responseJson: { [key: string]: string | bigint } = {};
    Object.entries(response).forEach(([key, value]) => {
        if (typeof value === "bigint") {
            responseJson[key] = value.toString() + 'n';
        } else {
            responseJson[key] = value;
        }
    });

    console.log(JSON.stringify(responseJson));
    return response;
}

export const royaltyClaimableRevenue = async function (wallet: keyof typeof storyClients, royaltyVaultIpId: Address, account: Address, snapshotId: string | number | bigint, token: Address, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.claimableRevenue({
        royaltyVaultIpId: royaltyVaultIpId,
        account: account,
        snapshotId: snapshotId,
        token: token
    })

    const responseJson: { [key: string]: string | bigint } = {};
    Object.entries(response).forEach(([key, value]) => {
        if (typeof value === "bigint") {
            responseJson[key] = value.toString() + 'n';
        } else {
            responseJson[key] = value;
        }
    });

    return response;
}

export const royaltyClaimRevenue = async function (wallet: keyof typeof storyClients, snapshotIds:string[] | bigint[] | number[], royaltyVaultIpId: Hex, account: Hex, token: Hex, waitForTransaction: boolean) {
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

    const responseJson: { [key: string]: string | bigint } = {};
    Object.entries(response).forEach(([key, value]) => {
        if (typeof value === "bigint") {
            responseJson[key] = value.toString() + 'n';
        } else {
            responseJson[key] = value;
        }
    });

    console.log(JSON.stringify(responseJson));
    return response;
}

export const raiseDispute = async function (wallet: keyof typeof storyClients, targetIpId: Hex, arbitrationPolicy: Hex, linkToDisputeEvidence: string, targetTag: string, waitForTransaction: boolean) {
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

    const responseJson: { [key: string]: string | bigint } = {};
    Object.entries(response).forEach(([key, value]) => {
        if (typeof value === "bigint") {
            responseJson[key] = value.toString() + 'n';
        } else {
            responseJson[key] = value;
        }
    });

    console.log(JSON.stringify(responseJson));
    return response;
}

export const cancelDispute = async function (wallet: keyof typeof storyClients, disputeId: string | number | bigint, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.dispute.cancelDispute({
        disputeId: disputeId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    });
    console.log(JSON.stringify(response));
    return response;
}

export const resolveDispute = async function (wallet: keyof typeof storyClients, disputeId: string | number | bigint, data: Hex, waitForTransaction: boolean) {
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
