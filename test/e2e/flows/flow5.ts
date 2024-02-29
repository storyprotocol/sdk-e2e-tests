import { Hex } from 'viem';
import {
  mintNFT,
  registerIpWithExistingPolicy,
  registerCommercialUsePolicy,
  registerDerivativeIP,
  sleep,
  mintLicense,
} from '../../../utils/utils';

export default async function testFlow5() {
  const policyId = await registerCommercialUsePolicy();
  // const NFTIdOfA = await mintNFT('A');
  // const NFTIdOfB = await mintNFT('B');
  // const NFTIdOfC = await mintNFT('C');
  const NFTIdOfA = '277';
  const NFTIdOfB = '272';
  const NFTIdOfC = '268';
  await sleep(5);
  if (!policyId) return 1;
  const ipIdOfA = (await registerIpWithExistingPolicy(NFTIdOfA, policyId, 'A')) as Hex;
  await sleep(5);
  if (!ipIdOfA || !policyId) return 2;
  const licenseId = await mintLicense(ipIdOfA, policyId, 'B', 'B');
  await sleep(100);
  if (!licenseId) return 3;
  const ipIdOfB = (await registerDerivativeIP(NFTIdOfB, [licenseId], 'B')) as Hex;
  await sleep(5);

  const licenseIdFromA = await mintLicense(ipIdOfA, policyId, 'C', 'C');
  const licenseIdFromB = await mintLicense(ipIdOfB, policyId, 'C', 'C');
  if (!licenseIdFromA || !licenseIdFromB) return 4;
  await sleep(100);
  await registerDerivativeIP(NFTIdOfC, [licenseIdFromA, licenseIdFromB], 'C');
}
