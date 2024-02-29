import { Hex } from 'viem';
import {
  mintNFT,
  sleep,
  registerRootIp,
  registerSocialRemixPolicy,
  registerSocialRemixPolicy2,
  registerSocialRemixPolicy3,
  registerCommercialUsePolicy,
  addOnePolicyToIp,
  mintLicense,
  registerDerivativeIP,
} from '../../../utils/utils';

// multiple policy
export default async function testFlow6() {
  const NFTIdOfA = await mintNFT('A');
  const NFTIdOfB1 = await mintNFT('B');
  const NFTIdOfB2 = await mintNFT('B');
  const NFTIdOfB3 = await mintNFT('B');
  const NFTIdOfB4 = await mintNFT('B');
  const remixPolicyId1 = await registerSocialRemixPolicy();
  const remixPolicyId2 = await registerSocialRemixPolicy2();
  const remixPolicyId3 = await registerSocialRemixPolicy3();
  const commercialPolicyId1 = await registerCommercialUsePolicy();
  await sleep(5);
  const ipIdOfA = (await registerRootIp(NFTIdOfA)) as Hex;
  await sleep(5);
  if (!ipIdOfA || !remixPolicyId1 || !remixPolicyId2 || !remixPolicyId3 || !commercialPolicyId1) return;
  await addOnePolicyToIp(ipIdOfA, remixPolicyId1);
  await addOnePolicyToIp(ipIdOfA, remixPolicyId2);
  await addOnePolicyToIp(ipIdOfA, remixPolicyId3);
  await addOnePolicyToIp(ipIdOfA, commercialPolicyId1);
  await sleep(5);

  const licenseId1 = await mintLicense(ipIdOfA, remixPolicyId1, 'B', 'A');
  const licenseId2 = await mintLicense(ipIdOfA, remixPolicyId2, 'B', 'A');
  const licenseId3 = await mintLicense(ipIdOfA, remixPolicyId3, 'B', 'A');
  const licenseId4 = await mintLicense(ipIdOfA, commercialPolicyId1, 'B', 'B');
  await sleep(30);
  if (!licenseId1 || !licenseId2 || !licenseId3 || !licenseId4) return;
  await Promise.allSettled([
    registerDerivativeIP(NFTIdOfB1, [licenseId1], 'B'),
    registerDerivativeIP(NFTIdOfB2, [licenseId2], 'B'),
    registerDerivativeIP(NFTIdOfB3, [licenseId3], 'B'),
    registerDerivativeIP(NFTIdOfB4, [licenseId4], 'B'),
  ]);
}
