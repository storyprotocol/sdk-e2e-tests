import { royaltyPolicyLAPAddress } from '../../config/config';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { expect } from 'chai';
chai.use(chaiAsPromised);
import '../setup';
import { getLicenseTerms } from '../../utils/sdkUtils';
import { nonComLicenseTermsId, comUseLicenseTermsId1, comRemixLicenseTermsId1, mintingFee1, commercialRevShare1 } from '../setup';

describe("SDK Test", function () {
    describe("Get license terms - license.getLicenseTerms", async function () {
        describe("Get license terms - Positive tests", async function () {
            it("licenseTermsId: 0", async function () {
                const response = await expect(
                    getLicenseTerms("A", 0)
                ).to.not.be.rejected;

                expect(response.terms.transferable).to.be.a("boolean").and.to.be.false;
                expect(response.terms.commercialUse).to.be.a("boolean").and.to.be.false;
                expect(response.terms.commercialAttribution).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesAllowed).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesAttribution).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesApproval).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesReciprocal).to.be.a("boolean").and.to.be.false;
                expect(response.terms.mintingFee).to.be.a("bigint").and.to.be.equal(0n);
                expect(response.terms.expiration).to.be.a("bigint").and.to.be.equal(0n);
            });

            it("licenseTermsId: null", async function () {
                const response = await expect(
                    getLicenseTerms("A", "")
                ).to.not.be.rejected;

                expect(response.terms.transferable).to.be.a("boolean").and.to.be.false;
                expect(response.terms.commercialUse).to.be.a("boolean").and.to.be.false;
                expect(response.terms.commercialAttribution).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesAllowed).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesAttribution).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesApproval).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesReciprocal).to.be.a("boolean").and.to.be.false;
                expect(response.terms.mintingFee).to.be.a("bigint").and.to.be.equal(0n);
                expect(response.terms.expiration).to.be.a("bigint").and.to.be.equal(0n);
            });

            it("Non Commercial License Terms", async function () {
                const response = await expect(
                    getLicenseTerms("A", nonComLicenseTermsId)
                ).to.not.be.rejected;

                expect(response.terms.transferable).to.be.a("boolean").and.to.be.true;
                expect(response.terms.commercialUse).to.be.a("boolean").and.to.be.false;
                expect(response.terms.commercialAttribution).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesAllowed).to.be.a("boolean").and.to.be.true;
                expect(response.terms.derivativesAttribution).to.be.a("boolean").and.to.be.true;
                expect(response.terms.derivativesApproval).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesReciprocal).to.be.a("boolean").and.to.be.true;
                expect(response.terms.mintingFee).to.be.a("bigint").and.to.be.equal(0n);
                expect(response.terms.expiration).to.be.a("bigint").and.to.be.equal(0n);
            });

            it("Commercial Use License Terms", async function () {
                const response = await expect(
                    getLicenseTerms("B", comUseLicenseTermsId1)
                ).to.not.be.rejected;

                expect(response.terms.transferable).to.be.a("boolean").and.to.be.true;
                expect(response.terms.royaltyPolicy).to.be.a("string").and.to.be.equal(royaltyPolicyLAPAddress);
                expect(response.terms.commercialUse).to.be.a("boolean").and.to.be.true;
                expect(response.terms.commercialAttribution).to.be.a("boolean").and.to.be.true;
                expect(response.terms.derivativesAllowed).to.be.a("boolean").and.to.be.true;
                expect(response.terms.derivativesAttribution).to.be.a("boolean").and.to.be.true;
                expect(response.terms.derivativesApproval).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesReciprocal).to.be.a("boolean").and.to.be.false;
                expect(response.terms.mintingFee).to.be.a("bigint").and.to.be.equal(BigInt(mintingFee1));
                expect(response.terms.expiration).to.be.a("bigint").and.to.be.equal(0n);
            });

            it("Commercial Remix License Terms", async function () {
                const response = await expect(
                    getLicenseTerms("C", comRemixLicenseTermsId1)
                ).to.not.be.rejected;

                expect(response.terms.transferable).to.be.a("boolean").and.to.be.true;
                expect(response.terms.royaltyPolicy).to.be.a("string").and.to.be.equal(royaltyPolicyLAPAddress);
                expect(response.terms.commercialUse).to.be.a("boolean").and.to.be.true;
                expect(response.terms.commercialAttribution).to.be.a("boolean").and.to.be.true;
                expect(response.terms.derivativesAllowed).to.be.a("boolean").and.to.be.true;
                expect(response.terms.derivativesAttribution).to.be.a("boolean").and.to.be.true;
                expect(response.terms.derivativesApproval).to.be.a("boolean").and.to.be.false;
                expect(response.terms.derivativesReciprocal).to.be.a("boolean").and.to.be.true;
                expect(response.terms.mintingFee).to.be.a("bigint").and.to.be.equal(BigInt(mintingFee1));
                expect(response.terms.commercialRevShare).to.be.a("number").and.to.be.equal(commercialRevShare1 * 1000000);
                expect(response.terms.expiration).to.be.a("bigint").and.to.be.equal(0n);
            });                
        });

        describe("Get license terms - Negative tests", async function () {
            it("Get license terms with invalid licenseTermsId: undefined", async function () {
                let licenseTermsId: any;
                const response = await expect(
                    getLicenseTerms("A", licenseTermsId)
                ).to.be.rejectedWith("Failed to get license terms: Cannot convert undefined to a BigInt");
            });               

            it("Get license terms with invalid licenseTermsId: -1", async function () {
                const response = await expect(
                    getLicenseTerms("A", "-1")
                ).to.be.rejectedWith("Failed to get license terms: Number \"-1n\" is not in safe 256-bit unsigned integer range (0n to 115792089237316195423570985008687907853269984665640564039457584007913129639935n");
            });               

            it("Get license terms with invalid licenseTermsId: test", async function () {
                const response = await expect(
                    getLicenseTerms("A", "test")
                ).to.be.rejectedWith("Failed to get license terms: Cannot convert test to a BigInt");
            });                                          
        });
    });
});
