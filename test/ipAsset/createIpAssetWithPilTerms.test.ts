import { nftContractAddress } from '../../config/config';
import { createIpAssetWithPilTerms } from '../../utils/sdkUtils';
import { expect } from 'chai'
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);
import '../setup';
import { PIL_TYPE } from "@story-protocol/core-sdk/dist/declarations/src/types/resources/license";

describe('SDK Test', function () {
    describe('Test ipAsset.createIpAssetWithPilTerms Function', async function () {
        it("Register an IP asset with non-commercial remix license term", async function () {
            const response = await expect(
                createIpAssetWithPilTerms("A", nftContractAddress, PIL_TYPE.NON_COMMERCIAL_REMIX, true)
            ).to.not.be.rejected;
        });

        it("Register an IP asset with commercial use license term", async function () {
            const response = await expect(
                createIpAssetWithPilTerms("A", nftContractAddress, PIL_TYPE.COMMERCIAL_USE, true)
            ).to.not.be.rejected;
        });

        it("Register an IP asset with commercial remix license term", async function () {
            const response = await expect(
                createIpAssetWithPilTerms("A", nftContractAddress, PIL_TYPE.COMMERCIAL_REMIX, true)
            ).to.not.be.rejected;
        });
    });
});
