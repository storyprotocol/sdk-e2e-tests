import { Hex } from 'viem';
import {
  mintNFT,
  registerRootIp,
  registerSocialRemixPolicy,
  registerDerivativeIP,
  mintLicense,
  sleep,
} from '../../../utils/utils';

export default async function testFlow1() {
  const NFTIdOfA = await mintNFT('A');
  const NFTIdOfB = await mintNFT('B');
  const policyId = await registerSocialRemixPolicy();
  await sleep(5);
  const ipId = (await registerRootIp(NFTIdOfA)) as Hex;
  await sleep(5);
  if (!ipId || !policyId) return;
  const licenseId = await mintLicense(ipId, policyId, 'B', 'A');
  await sleep(30);
  if (!licenseId) return;
  await registerDerivativeIP(NFTIdOfB, [licenseId], 'B');
}
