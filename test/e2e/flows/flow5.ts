import { Hex } from 'viem';
import {
  mintNFT,
  registerIpWithExistingPolicy,
  registerCommercialUsePolicy,
  registerDerivativeIP,
  sleep,
  mintLicense,
} from '../../../utils/utils';

// test royalty.
// You need to approve an amount of funds to the royalty policy contract in advance.
export default async function testFlow5() {
  const policyId = await registerCommercialUsePolicy();
  const NFTIdOfA = await mintNFT('A');
  const NFTIdOfB = await mintNFT('B');
  const NFTIdOfC = await mintNFT('C');
  await sleep(5);
  const ipIdOfA = (await registerIpWithExistingPolicy(NFTIdOfA, policyId!, 'A')) as Hex;
  await sleep(5);
  if (!ipIdOfA || !policyId) return 'register root ip failed';
  const licenseId = await mintLicense(ipIdOfA, policyId, 'B', 'B');
  await sleep(60);
  if (!licenseId) return 'wallet B mint license failed';
  const ipIdOfB = (await registerDerivativeIP(NFTIdOfB, [licenseId], 'B')) as Hex;
  await sleep(5);

  const licenseIdFromA = await mintLicense(ipIdOfA, policyId, 'C', 'C');
  const licenseIdFromB = await mintLicense(ipIdOfB, policyId, 'C', 'C');
  if (!licenseIdFromA || !licenseIdFromB) return 'wallet C mint license failed';
  await sleep(60);
  await registerDerivativeIP(NFTIdOfC, [licenseIdFromA, licenseIdFromB], 'C');
}
