import { CID } from "multiformats/cid"; 
import bs58 from "bs58";
import { base58btc } from "multiformats/bases/base58";
import { Hex } from "viem";

// Define the prefix for v0 CIDs
const v0Prefix = "1220";

// Function to convert CID to IPFS hash
export const convertCIDtoHashIPFS = (cid: string): Hex => {
  // Check if the CID is a v0 CID (starts with "Qm")
  const isV0 = cid.startsWith("Qm");
  
  // Parse the CID
  const parsedCID = CID.parse(cid);
  
  // Convert to base58 CID if it's v0, otherwise convert to v0
  const base58CID = isV0 ? parsedCID.toString() : parsedCID.toV0().toString();
  
  // Decode the base58 CID to bytes
  const bytes = bs58.decode(base58CID);
  
  // Convert bytes to a hexadecimal string
  const base16CID = Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
  
  // Return the hash in hexadecimal format, prefixed with "0x"
  return ("0x" + base16CID.slice(v0Prefix.length)) as Hex;
};

// Main function to demonstrate the conversion
const main = async () => {
  // Example CID to convert
  const cid = "bafkreid5gk7c75i6u5gtfqfotgbhbu2c2hvvvpj4xv62es4tbbanbutmd4"; // Replace with a valid CID

  try {
    const hash = convertCIDtoHashIPFS(cid);
    console.log(`Converted IPFS Hash: ${hash}`);
  } catch (error) {
    console.error("Error converting CID to IPFS hash:", error);
  }
};

// Execute the main function
main();