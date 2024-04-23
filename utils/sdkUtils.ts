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

export const registerIpAsset = async function (wallet: keyof typeof storyClients, tokenContractAddress: Address, tokenId: string, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.register({
        tokenContract: tokenContractAddress,
        tokenId: tokenId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    })
    console.log(JSON.stringify(response))
    return response
}

export const registerDerivative = async function (wallet: keyof typeof storyClients, childIpId: Hex, parentIpIds: `0x${string}`[], licenseTermsIds: string[], waitForTransaction: boolean) {
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

export const registerDerivativeWithLicenseTokens = async function (wallet: keyof typeof storyClients, childIpId: Hex, licenseTokenIds: string[], waitForTransaction: boolean) {
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
    })
    console.log(JSON.stringify(response))
    return response
}

export const registerCommercialRemixPIL = async function (wallet: keyof typeof storyClients, mintingFee: string, commercialRevShare: number, currency: Hex, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.registerCommercialRemixPIL({
        mintingFee: mintingFee,
        commercialRevShare: commercialRevShare,
        currency: currency,
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    })
    console.log(JSON.stringify(response))
    return response
}

export const registerCommercialUsePIL = async function (wallet: keyof typeof storyClients, mintingFee: string, currency: Hex, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.registerCommercialUsePIL({
        mintingFee: mintingFee,
        currency: currency,
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    })
    console.log(JSON.stringify(response))
    return response
}

export const attachLicenseTerms = async function (wallet: keyof typeof storyClients, ipId: Hex, licenseTermsId: string, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.attachLicenseTerms({
        ipId: ipId,
        licenseTermsId: licenseTermsId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    })
    console.log(JSON.stringify(response))
    return response
}

export const mintLicenseTokens = async function (wallet: keyof typeof storyClients, licensorIpId: Hex, licenseTermsId: string, amount: number, receiver: Hex, waitForTransaction: boolean) {
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
    console.log(JSON.stringify(response))
    return response
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

export const royaltySnapshot = async function (wallet: keyof typeof storyClients, royaltyVaultIpId: Hex, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.snapshot({
        royaltyVaultIpId: royaltyVaultIpId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    })

    return response;
}

export const payRoyaltyOnBehalf = async function (wallet: keyof typeof storyClients, receiverIpId: Hex, payerIpId: Hex, token: Address, amount: bigint, waitForTransaction: boolean) {
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
    })
    console.log(JSON.stringify(response));
    return response;
}

export const royaltyClaimableRevenue = async function (wallet: keyof typeof storyClients, royaltyVaultIpId: Hex, account: Address, snapshotId: string, token: Address, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.claimableRevenue({
        royaltyVaultIpId: royaltyVaultIpId,
        account: account,
        snapshotId: snapshotId,
        token: token,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    })
    // console.log(JSON.stringify(String(response)));
    return response;
}

export const royaltyClaimRevenue = async function (wallet: keyof typeof storyClients, snapshotIds: string[], royaltyVaultIpId: Hex, token: Address, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.royalty.claimRevenue({
        snapshotIds: snapshotIds,
        royaltyVaultIpId: royaltyVaultIpId,
        token: token,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    })
    return response;
}
