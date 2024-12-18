import { Hex, zeroAddress } from "viem";

export const HashZero = "0x0000000000000000000000000000000000000000000000000000000000000000";

export const terms = {
  transferable: true,
  royaltyPolicy: zeroAddress as Hex,
  defaultMintingFee: 0,
  expiration: 0,
  commercialUse: false,
  commercialAttribution: false,
  commercializerChecker: zeroAddress as Hex,
  commercializerCheckerData: zeroAddress as Hex,
  commercialRevShare: 0,
  commercialRevCeiling: 0,
  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativesApproval: false,
  derivativesReciprocal: true,
  derivativeRevCeiling: 0,
  currency: zeroAddress as Hex,
  uri: "",
};