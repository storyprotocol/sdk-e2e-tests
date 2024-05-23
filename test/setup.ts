import addContext = require("mochawesome/addContext");
import { captureConsoleLogs } from "../utils/utils";
import { mintingFeeTokenAddress } from '../config/config';
import { registerNonComSocialRemixingPIL, registerCommercialUsePIL, registerCommercialRemixPIL } from '../utils/sdkUtils';
import { expect } from 'chai';

let consoleLogs: string[] = [];
let nonComLicenseTermsId: bigint;
let comUseLicenseTermsId1: bigint;
let comUseLicenseTermsId2: bigint;
let comRemixLicenseTermsId1: bigint;
let comRemixLicenseTermsId2: bigint;

const mintingFee1: string = "100";
const mintingFee2: string = "60";
const commercialRevShare1: number = 10;
const commercialRevShare2: number = 20;

beforeEach(function () {
  consoleLogs = captureConsoleLogs(consoleLogs);
});

afterEach(function () {
  if (consoleLogs.length > 0) {
    addContext(this, {
      title: 'Test Result',
      value: consoleLogs[0],
    });
  };
});

before("Register License Terms", async function () {
  it("Register Non-Commercial Social Remixing License Terms", async function () {
    const responseNonComLicenseTerms = await expect(
      registerNonComSocialRemixingPIL("A", true)
    ).to.not.be.rejected;

    expect(responseNonComLicenseTerms.licenseTermsId).to.be.a("bigint").and.to.be.ok;
    nonComLicenseTermsId = responseNonComLicenseTerms.licenseTermsId;
  });

  it("Register Commercial Use License Terms", async function () {
    const responseComUseLicenseTerms1 = await expect(
      registerCommercialUsePIL("A", mintingFee1, mintingFeeTokenAddress, true)
    ).to.not.be.rejected;

    expect(responseComUseLicenseTerms1.licenseTermsId).to.be.a("bigint").and.to.be.ok;
    comUseLicenseTermsId1 = responseComUseLicenseTerms1.licenseTermsId;

    const responseComUseLicenseTerms2 = await expect(
      registerCommercialUsePIL("A", mintingFee2, mintingFeeTokenAddress, true)
    ).to.not.be.rejected;

    expect(responseComUseLicenseTerms1.licenseTermsId).to.be.a("bigint").and.to.be.ok;
    comUseLicenseTermsId2 = responseComUseLicenseTerms2.licenseTermsId;    
  });

  it("Register Commercial Remix License Terms", async function () {
    const responseComRemixLicenseTerms1 = await expect(
      registerCommercialRemixPIL("A", mintingFee1, commercialRevShare1, mintingFeeTokenAddress, true)
    ).to.not.be.rejected;

    expect(responseComRemixLicenseTerms1.licenseTermsId).to.be.a("bigint").and.to.be.ok;
    comRemixLicenseTermsId1 = responseComRemixLicenseTerms1.licenseTermsId;

    const responseComRemixLicenseTerms2 = await expect(
      registerCommercialRemixPIL("A", mintingFee2, commercialRevShare2, mintingFeeTokenAddress, true)
    ).to.not.be.rejected;

    expect(responseComRemixLicenseTerms1.licenseTermsId).to.be.a("bigint").and.to.be.ok;
    comRemixLicenseTermsId2 = responseComRemixLicenseTerms2.licenseTermsId;    
  });
});

export { 
  nonComLicenseTermsId, 
  comUseLicenseTermsId1, 
  comUseLicenseTermsId2, 
  comRemixLicenseTermsId1, 
  comRemixLicenseTermsId2, 
  mintingFee1,
  mintingFee2, 
  commercialRevShare1,
  commercialRevShare2
};
