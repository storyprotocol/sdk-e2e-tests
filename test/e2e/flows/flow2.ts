import { Hex } from 'viem';
import { mintNFT, sleep, registerSocialRemixPolicy, registerRootIp, linkIpToParent, mintLicense } from '../../../utils/utils';

export default async function testFlow2() {
  // const NFTIdOfA = await mintNFT('A');
  // const NFTIdOfB = await mintNFT('B');
  const policyId = await registerSocialRemixPolicy();
  const NFTIdOfA = '201';
  const NFTIdOfB = '208';
  await sleep(5);
  const ipId = (await registerRootIp(NFTIdOfA)) as Hex;
  await sleep(5);
  if (!ipId || !policyId) return;
  const licenseId = await mintLicense(ipId, policyId, 'B', 'A');
  await sleep(5);
  if (!licenseId) return;
  const ipOfB = (await registerRootIp(NFTIdOfB, 'B')) as Hex;
  await sleep(5);
  linkIpToParent(ipOfB, [licenseId], 'B');
}
