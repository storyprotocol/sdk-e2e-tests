import { mockERC20Address } from '../../config/config';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { registerCommercialRemixPIL, registerCommercialUsePIL, registerNonComSocialRemixingPIL } from '../../utils/sdkUtils';

describe("SDK Test", function () {
    describe("Register PIL", async function () {
        describe("Register Non-Commercial Social Remixing PIL (license.registerNonComSocialRemixingPIL)", async function () {
            it("Register Non-Commercial Social Remixing PIL with waitForTransaction: undefined", async function () {
                let waitForTransaction: any;
                const response = await expect(
                    registerNonComSocialRemixingPIL("A", waitForTransaction)
                ).to.not.be.rejected;
                expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            });
    
            it("Register Non-Commercial Social Remixing PIL with waitForTransaction: true", async function () {
                const response = await expect(
                    registerNonComSocialRemixingPIL("A", true)
                ).to.not.be.rejected;
                expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            });
    
            it("Register Non-Commercial Social Remixing PIL with waitForTransaction: false", async function () {
                const response = await expect(
                    registerNonComSocialRemixingPIL("A", false)
                ).to.not.be.rejected;
                expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            });            
        })

        describe("Register Commercial Use PIL (license.registerCommercialUsePIL)", async function () {
            it("Register Commercial Use PIL with mintingFee: undefined", async function () {
                let mintingFee: any;
                const response = await expect(
                    registerCommercialUsePIL("A", mintingFee, mockERC20Address, true)
                ).to.be.rejectedWith(`Failed to register commercial use PIL: DefaultMintingFee, currency are required for commercial use PIL.`);
            });
    
            it("Register Commercial Use PIL with an invalid mintingFee value (test)", async function () {
                const response = await expect(
                    registerCommercialUsePIL("A", "test", mockERC20Address, true)
                ).to.be.rejectedWith("Failed to register commercial use PIL: Cannot convert test to a BigInt");
            });
    
            it("Register Commercial Use PIL with an invalid mintingFee value (-1)", async function () {
                const response = await expect(
                    registerCommercialUsePIL("A", "-1", mockERC20Address, true)
                ).to.be.rejectedWith("Failed to register commercial use PIL: Number \"-1n\" is not in safe 256-bit unsigned integer range");
            });
    
            it("Register Commercial Use PIL with currency: undefined", async function () {
                let currency: any;
                const response = await expect(
                    registerCommercialUsePIL("A", "0", currency, true)
                ).to.be.rejectedWith("Failed to register commercial use PIL: DefaultMintingFee, currency are required for commercial use PIL.");
            });
    
            it("Register Commercial Use PIL with an invalid currency address", async function () {
                const response = await expect(
                    registerCommercialUsePIL("A", "0", "0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAB", true)
                ).to.be.rejectedWith("Failed to register commercial use PIL: The contract function \"registerLicenseTerms\" reverted.", "Error: PILicenseTemplate__CurrencyTokenNotWhitelisted()");
            });
    
            it("Register Commercial Use PIL with waitForTransaction: undefined", async function () {
                let waitForTransaction: any;
                const response = await expect(
                    registerCommercialUsePIL("A", "0", mockERC20Address, waitForTransaction)
                ).to.not.be.rejected;
                expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            });            
    
            it("Register Commercial Use PIL with waitForTransaction: true", async function () {
                const response = await expect(
                    registerCommercialUsePIL("A", "0", mockERC20Address, true)
                ).to.not.be.rejected;
                expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            });            
    
            it("Register Commercial Use PIL with waitForTransaction: false", async function () {
                const response = await expect(
                    registerCommercialUsePIL("A", "16", mockERC20Address, false)
                ).to.not.be.rejected;

                if (response.licenseTermsId) {
                    expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
                } else {
                    expect(response.txHash).to.be.a("string").and.not.to.be.empty;
                    expect(response.licenseTermsId).not.to.be.exist;
                };
            });            
        })
                
        describe("Register Commercial Remix PIL (license.registerCommercialRemixPIL)", async function () {
            it("Register Commercial Remix PIL with mintingFee: undefined", async function () {
                let mintingFee: any;
                const response = await expect(
                    registerCommercialRemixPIL("A", mintingFee, 100, mockERC20Address, true)
                ).to.be.rejectedWith("Failed to register commercial remix PIL: DefaultMintingFee, currency and commercialRevShare are required for commercial remix PIL.");
            });
    
            it("Register Commercial Remix PIL with an invalid mintingFee value (test)", async function () {
                const response = await expect(
                    registerCommercialRemixPIL("A", "test", 100, mockERC20Address, true)
                ).to.be.rejectedWith("Failed to register commercial remix PIL: Cannot convert test to a BigInt");
            });
    
            it("Register Commercial Remix PIL with an invalid mintingFee value (-1)", async function () {
                const response = await expect(
                    registerCommercialRemixPIL("A", "-1", 100, mockERC20Address, true)
                ).to.be.rejectedWith("Failed to register commercial remix PIL: Number \"-1n\" is not in safe 256-bit unsigned integer range");
            });

            it("Register Commercial Remix PIL with commercialRevShare: undefined", async function () {
                let commercialRevShare: any;
                const response = await expect(
                    registerCommercialRemixPIL("A", "0", commercialRevShare, mockERC20Address, true)
                ).to.be.rejectedWith("Failed to register commercial remix PIL: DefaultMintingFee, currency and commercialRevShare are required for commercial remix PIL.");
            });
    
            it("Register Commercial Remix PIL with an invalid commercialRevShare value (-1)", async function () {
                const response = await expect(
                    registerCommercialRemixPIL("A", "0", -1, mockERC20Address, true)
                ).to.be.rejectedWith("Failed to register commercial remix PIL: CommercialRevShare should be between 0 and 100.");
            });
    
            it("Register Commercial Remix PIL with an invalid commercialRevShare value (101)", async function () {
                const response = await expect(
                    registerCommercialRemixPIL("A", "0", 101, mockERC20Address, true)
                ).to.be.rejectedWith("Failed to register commercial remix PIL: CommercialRevShare should be between 0 and 100.");
            });
    
            it("Register Commercial Remix PIL with currency: undefined", async function () {
                let currency: any;
                const response = await expect(
                    registerCommercialRemixPIL("A", "0", 0, currency, true)
                ).to.be.rejectedWith("Failed to register commercial remix PIL: DefaultMintingFee, currency and commercialRevShare are required for commercial remix PIL.");
            });
    
            it("Register Commercial Remix PIL with an invalid currency address", async function () {
                const response = await expect(
                    registerCommercialRemixPIL("A", "0", 0, "0xA36F2A4A02f5C215d1b3630f71A4Ff55B5492AAB", true)
                ).to.be.rejectedWith("Failed to register commercial remix PIL: The contract function \"registerLicenseTerms\" reverted.", "Error: PILicenseTemplate__CurrencyTokenNotWhitelisted()");
            });
    
            it("Register Commercial Remix PIL with waitForTransaction: undefined", async function () {
                let waitForTransaction: any;
                const response = await expect(
                    registerCommercialRemixPIL("A", "0", 0, mockERC20Address, waitForTransaction)
                ).to.not.be.rejected;

                if (response.licenseTermsId) {
                    expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
                } else {
                    expect(response.txHash).to.be.a("string").and.not.to.be.empty;
                    expect(response.licenseTermsId).not.to.be.exist;
                };
            });            
    
            it("Register Commercial Remix PIL with waitForTransaction: true", async function () {
                const response = await expect(
                    registerCommercialRemixPIL("A", "0", 100, mockERC20Address, true)
                ).to.not.be.rejected;
                expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
            });            
    
            it("Register Commercial Remix PIL with waitForTransaction: false", async function () {
                const response = await expect(
                    registerCommercialRemixPIL("A", "16", 100, mockERC20Address, false)
                ).to.not.be.rejected;

                if (response.licenseTermsId) {
                    expect(response.licenseTermsId).to.be.a("bigint").and.to.be.ok;
                } else {
                    expect(response.txHash).to.be.a("string").and.not.to.be.empty;
                    expect(response.licenseTermsId).not.to.be.exist;
                };
            });            
        })
    });
});
