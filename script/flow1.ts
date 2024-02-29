import { Hex } from 'viem';
import { mintNFT, registerRootIp, registerSocialRemixPolicy, registerDerivativeIP, mintLicense, sleep } from './utils';

export async function testFlow1() {
  // const NFTIdOfA = await mintNFT('A');
  // const NFTIdOfB = await mintNFT('B');
  const policyId = await registerSocialRemixPolicy();
  const NFTIdOfA = '200';
  const NFTIdOfB = '207';
  await sleep(5);
  const ipId = (await registerRootIp(NFTIdOfA)) as Hex;
  await sleep(5);
  if (!ipId || !policyId) return;
  const licenseId = await mintLicense(ipId, policyId, 'B', 'A');
  await sleep(5);
  if (!licenseId) return;
  registerDerivativeIP(NFTIdOfB, [licenseId], 'B');
}
