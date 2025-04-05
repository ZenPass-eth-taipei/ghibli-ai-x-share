const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const pinataJWT = process.env.PINATA_JWT;

if (!pinataJWT) {
  console.error(" PINATA_JWT is not set in .env file");
  process.exit(1);
}

async function uploadToPinata(buffer) {
  try {
    const formData = new FormData();
    formData.append("file", buffer, {
      filename: "image.png",
      contentType: "image/png",
    });

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxBodyLength: "Infinity",
        headers: {
          Authorization: `Bearer ${pinataJWT}`,
        },
      }
    );

    const cid = res.data.IpfsHash;
    console.log(" Uploaded to Pinata. CID:", cid);
    return `https://gateway.pinata.cloud/ipfs/${cid}`;
  } catch (error) {
    console.error(
      "Pinata upload error:",
      error.response?.data || error.message
    );
    throw new Error("Failed to upload to Pinata");
  }
}

module.exports = { uploadToPinata };
