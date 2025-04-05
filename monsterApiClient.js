const axios = require("axios");
require("dotenv").config();

async function generateFantasyImage(imageUrl, prompt, apiKey) {
  const url = "https://api.monsterapi.ai/v1/generate/pix2pix";

  const payload = {
    init_image_url: imageUrl,
    prompt: prompt,
    negprompt: "deformed, bad anatomy, disfigured, poorly drawn face",
    steps: 50,
    guidance_scale: 12.5,
    image_guidance_scale: 1.0,
    seed: 21,
  };

  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    authorization: `Bearer ${apiKey}`,
  };

  try {
    const response = await axios.post(url, payload, { headers });
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error generating image:",
      error.response?.data || error.message
    );
    throw error;
  }
}

module.exports = { generateFantasyImage };
