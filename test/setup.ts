import addContext = require("mochawesome/addContext");
import { captureConsoleLogs } from "../utils/utils";
import { mintingFeeTokenAddress } from '../config/config';
import { registerNonComSocialRemixingPIL, registerCommercialUsePIL, registerCommercialRemixPIL } from '../utils/sdkUtils';
import { expect } from 'chai';

let consoleLogs: string[] = [];
let nonComLicenseTermsId: string;
let comUseLicenseTermsId1: string;
let comUseLicenseTermsId2: string;
let comRemixLicenseTermsId1: string;
let comRemixLicenseTermsId2: string;

const mintingFee1: string = "100";
const mintingFee2: string = "60";
const commercialRevShare1: number = 100;
const commercialRevShare2: number = 200;

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

    expect(responseNonComLicenseTerms.licenseTermsId).to.be.a("string").and.not.empty;
    nonComLicenseTermsId = responseNonComLicenseTerms.licenseTermsId;
  });

  it("Register Commercial Use License Terms", async function () {
    const responseComUseLicenseTerms1 = await expect(
      registerCommercialUsePIL("A", mintingFee1, mintingFeeTokenAddress, true)
    ).to.not.be.rejected;

    expect(responseComUseLicenseTerms1.licenseTermsId).to.be.a("string").and.not.empty;

    comUseLicenseTermsId1 = responseComUseLicenseTerms1.licenseTermsId;

    const responseComUseLicenseTerms2 = await expect(
      registerCommercialUsePIL("A", mintingFee2, mintingFeeTokenAddress, true)
    ).to.not.be.rejected;

    comUseLicenseTermsId2 = responseComUseLicenseTerms2.licenseTermsId;    
  });

  it("Register Commercial Remix License Terms", async function () {
    const responseComRemixLicenseTerms1 = await expect(
      registerCommercialRemixPIL("A", mintingFee1, commercialRevShare1, mintingFeeTokenAddress, true)
    ).to.not.be.rejected;

    expect(responseComRemixLicenseTerms1.licenseTermsId).to.be.a("string").and.not.empty;

    comRemixLicenseTermsId1 = responseComRemixLicenseTerms1.licenseTermsId;

    const responseComRemixLicenseTerms2 = await expect(
      registerCommercialRemixPIL("A", mintingFee2, commercialRevShare2, mintingFeeTokenAddress, true)
    ).to.not.be.rejected;

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
