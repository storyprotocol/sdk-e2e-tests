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

export default async function testFlow6() {
  // const NFTIdOfA = await mintNFT('A');
  // const NFTIdOfB = await mintNFT('B');
  const remixPolicyId1 = await registerSocialRemixPolicy();
  const remixPolicyId2 = await registerSocialRemixPolicy2();
  const remixPolicyId3 = await registerSocialRemixPolicy3();
  const commercialPolicyId1 = await registerCommercialUsePolicy();
  const NFTIdOfA = '237';
  const NFTIdOfB1 = '234';
  const NFTIdOfB2 = '235';
  const NFTIdOfB3 = '228';
  const NFTIdOfB4 = '236';
  const NFTIdOfB5 = '230';
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
  await sleep(5);
  if (!licenseId1) return;
  registerDerivativeIP(NFTIdOfB1, [licenseId1], 'B');

  const licenseId2 = await mintLicense(ipIdOfA, remixPolicyId2, 'B', 'A');
  await sleep(5);
  if (!licenseId2) return;
  registerDerivativeIP(NFTIdOfB2, [licenseId2], 'B');

  const licenseId3 = await mintLicense(ipIdOfA, remixPolicyId1, 'B', 'A');
  await sleep(5);
  if (!licenseId3) return;
  registerDerivativeIP(NFTIdOfB3, [licenseId1], 'B');

  const licenseId4 = await mintLicense(ipIdOfA, commercialPolicyId1, 'B', 'A');
  await sleep(5);
  if (!licenseId4) return;
  registerDerivativeIP(NFTIdOfB4, [licenseId1], 'B');

  registerDerivativeIP(NFTIdOfB5, [licenseId1, licenseId2], 'B');
}
