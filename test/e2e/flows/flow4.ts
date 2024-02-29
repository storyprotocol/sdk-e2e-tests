import { Hex } from 'viem';
import { mintNFT, sleep, grantIp, registerSocialRemixPolicy, mintLicense, registerRootIp } from '../../../utils/utils';

export default async function testFlow4() {
  const policyId = await registerSocialRemixPolicy();
  // const NFTIdOfA = await mintNFT('A');
  const NFTIdOfA = '204';
  await sleep(5);
  const ipId = (await registerRootIp(NFTIdOfA)) as Hex;
  await sleep(5);
  if (!ipId || !policyId) return;
  await grantIp(ipId, 'B', 'A');
  await sleep(5);
  await mintLicense(ipId, policyId, 'B', 'B');
}
