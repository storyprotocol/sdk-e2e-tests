import { Hex } from 'viem';
import { mintNFT, registerRootIp, registerDerivativeIP, mintLicense, sleep } from '../../../utils/utils';

// No policy should impossible to mint license
export default async function testFlow7() {
  try {
    const NFTIdOfA = await mintNFT('A');
    await sleep(5);
    const ipId = (await registerRootIp(NFTIdOfA)) as Hex;
    await sleep(5);
    if (!ipId) return;
    const licenseId = await mintLicense(ipId, '0', 'B', 'A');
  } catch (error) {
    console.log('cannot mint license without policy, it is expected behavior');
  }
}
