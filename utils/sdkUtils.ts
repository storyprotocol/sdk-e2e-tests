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
            waitForTransaction: waitForTransaction,
        }
    })
    console.log(JSON.stringify(response))
    return response
}

export const mintLicenseTokens = async function (wallet: keyof typeof storyClients, licensorIpId: Hex, licenseTermsId: Hex, amount: number, receiver: Hex, waitForTransaction: boolean) {
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

// export const linkIpToParent = async function (wallet: keyof typeof storyClients, licenseIds: string[], childIpId: Hex, waitForTransaction: boolean) {
//     const storyClient = getStoryClient(wallet);
//     const response = await storyClient.license.linkIpToParent({
//         licenseIds: licenseIds,
//         childIpId: childIpId,
//         txOptions: {
//             waitForTransaction: waitForTransaction,
//         }
//     })
//     console.log(JSON.stringify(response))
//     return response
// }

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


