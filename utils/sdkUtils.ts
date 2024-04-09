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

export const registerPILPolicy = async function (wallet: keyof typeof storyClients, transferable: boolean, waitForTransaction: boolean, options?: PolicyOptions) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.policy.registerPILPolicy({
        transferable: transferable,
        ...options,
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    })
    console.log(JSON.stringify(response))
    return response
}

export const addPolicyToIp = async function (wallet: keyof typeof storyClients, ipId: Hex, policyId: string, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.policy.addPolicyToIp({
        ipId: ipId,
        policyId: policyId,
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    })
    console.log(JSON.stringify(response))
    return response
}

export const mintLicense = async function (wallet: keyof typeof storyClients, policyId: string, ipId: Hex, mintAmount: number, receiverAddress: Hex, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.mintLicense({
        policyId: policyId,
        licensorIpId: ipId,
        mintAmount: mintAmount,
        receiverAddress: receiverAddress,
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    })
    console.log(JSON.stringify(response))
    return response
}

export const linkIpToParent = async function (wallet: keyof typeof storyClients, licenseIds: string[], childIpId: Hex, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.linkIpToParent({
        licenseIds: licenseIds,
        childIpId: childIpId,
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


