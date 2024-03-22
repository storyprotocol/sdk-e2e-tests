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

export const registerRootIp = async function (wallet: keyof typeof storyClients, policyId: string, tokenContractAddress: Address, tokenId: string, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.registerRootIp({
        policyId: policyId,
        tokenContractAddress: tokenContractAddress,
        tokenId: tokenId,
        txOptions: {
            waitForTransaction: waitForTransaction
        }
    })
    console.log(response)
    return response
}

export const registerPILPolicy = async function (wallet: keyof typeof storyClients, transferable: boolean, waitForTransaction: boolean, options?: PolicyOptions) {
    try {
        const storyClient = getStoryClient(wallet);
        const response = await storyClient.policy.registerPILPolicy({
            transferable: transferable,
            ...options,
            txOptions: {
                waitForTransaction: waitForTransaction,
            }
        })
        console.log(response)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const addPolicyToIp = async function (wallet: keyof typeof storyClients, ipId: Hex, policyId: string, waitForTransaction: boolean) {
    try {
        const storyClient = getStoryClient(wallet);
        const response = await storyClient.policy.addPolicyToIp({
            ipId: ipId,
            policyId: policyId,
            txOptions: {
                waitForTransaction: waitForTransaction,
            }
        })
        console.log(response)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const mintLicense = async function (wallet: keyof typeof storyClients, policyId: string, ipId: Hex, receiverAddress: Hex, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.license.mintLicense({
        policyId: policyId,
        licensorIpId: ipId,
        mintAmount: 1,
        receiverAddress: receiverAddress,
        txOptions: {
            waitForTransaction: waitForTransaction,
        }
    })
    console.log(response)
    return response
}

export const registerDerivativeIp = async function (wallet: keyof typeof storyClients, licenseIds: string[], tokenContractAddress: Hex, tokenId: string, waitForTransaction: boolean) {
    const storyClient = getStoryClient(wallet);
    const response = await storyClient.ipAsset.registerDerivativeIp({
        licenseIds: licenseIds,
        tokenContractAddress: tokenContractAddress,
        tokenId: tokenId,
        txOptions: {
            waitForTransaction: waitForTransaction,
        },
    })
    console.log(response)
    return response
}

export const linkIpToParent = async function (wallet: keyof typeof storyClients, licenseIds: string[], childIpId: Hex, waitForTransaction: boolean) {
    try {
        const storyClient = getStoryClient(wallet);
        const response = await storyClient.license.linkIpToParent({
            licenseIds: licenseIds,
            childIpId: childIpId,
            txOptions: {
              waitForTransaction: waitForTransaction,
            },
          })
        console.log(response)
        return response
    } catch (error) {
        console.log(error)
    }
}

export const setPermission = async function (wallet: keyof typeof storyClients, ipId: Hex, signer: Hex, to: Hex, permission: number, waitForTransaction: boolean) {
    try {
        const storyClient = getStoryClient(wallet);
        const response = await storyClient.permission.setPermission({
            ipId: ipId,
            signer: signer,
            to: to,
            permission: permission,
            txOptions: {
              waitForTransaction: waitForTransaction,
            },
          })
        console.log(response)
        return response
    } catch (error) {
        console.log(error)
    }
}
