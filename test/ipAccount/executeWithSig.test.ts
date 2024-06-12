import { privateKeyA, privateKeyB, clientA, accountA, chainId } from '../../config/config';
import { getDeadline, getWalletClient } from '../../utils/utils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { Address, Hex, encodeFunctionData, getAddress, toFunctionSelector } from 'viem';
import { getPermissionSignature, AccessPermission } from '@story-protocol/core-sdk';
import { mintNFTAndRegisterDerivative, mintNFTCreateRootIPandAttachPIL } from '../testUtils';
import { comUseLicenseTermsId1 } from '../setup';
import { accessControllerAbi } from '../../config/abi';
import { ipAccountExecuteWithSig } from '../../utils/sdkUtils';

let ipIdA: Address;
let ipIdB: Address;
let signature: Hex;

const coreMetadataModule = "0xDa498A3f7c8a88cb72201138C366bE3778dB9575" as Address;
const accessControllerAddress = "0xF9936a224b3Deb6f9A4645ccAfa66f7ECe83CF0A" as Address;
const deadline = getDeadline(60000n);
const walletClinet = getWalletClient(privateKeyA);

describe('SDK Test', function () {
    describe('Test ipAccount.executeWithSig Function', async function () {
        before("Mint 3 NFTs to Wallet A", async function () {
            // root IP: ipIdA
            ipIdA = await mintNFTCreateRootIPandAttachPIL("A", privateKeyA, comUseLicenseTermsId1);

            // ipIdB is ipIdA's derivative IP
            ipIdB = await mintNFTAndRegisterDerivative("B", privateKeyB, [ipIdA], [comUseLicenseTermsId1]);

            const state = await clientA.ipAccount.getIpAccountNonce(ipIdA);
            const expectedState = state + 1n;

            signature = await getPermissionSignature({
                ipId: ipIdA,
                wallet: walletClinet,
                permissions: [
                    {
                        ipId: ipIdA,
                        signer: accountA.address,
                        to: coreMetadataModule,
                        permission: AccessPermission.ALLOW,
                        func: "function setAll(address,string,bytes32,bytes32)",
                    },
                ],
                nonce: expectedState,
          
                chainId: BigInt(chainId),
                deadline: deadline,
            });          
        });

        it("ipAccount execute with siganature", async function () {
            console.log("ipIdA: " + ipIdA);

            const data = encodeFunctionData({
                abi: accessControllerAbi,
                functionName: "setPermission",
                args: [
                  getAddress(ipIdA),
                  getAddress(accountA.address),
                  getAddress(coreMetadataModule),
                  toFunctionSelector("function setAll(address,string,bytes32,bytes32)"),
                  AccessPermission.ALLOW,
                ],
            });

            const response = await ipAccountExecuteWithSig("A", ipIdA, accessControllerAddress, 0, data, accountA.address, deadline, signature, true);

            console.log(response);
          
            expect(response.txHash).to.be.a("string").and.not.empty;
        });
    });
});
