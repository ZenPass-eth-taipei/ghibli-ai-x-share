const express = require("express");
const bodyParser = require("body-parser");
const { generateFantasyImage } = require("./monsterApiClient");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// API Key from environment variables
const API_Key = process.env.MONSTERAI_API_KEY;

// Utility function to add a delay
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Polling function to check the status_url
const pollStatusUrl = async (
  statusUrl,
  apiKey,
  maxRetries = 10,
  interval = 6000
) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.get(statusUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        timeout: 30000, // Set timeout to 30 seconds
      });

      if (response.data?.status === "COMPLETED") {
        return response.data?.result?.output;
      }

      // Wait before the next poll
      await delay(interval);
    } catch (error) {
      console.error(`Polling attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) {
        throw new Error("Image generation timed out after multiple retries");
      }
    }
  }

  throw new Error("Image generation timed out");
};

// Endpoint to generate a fantasy image
app.post("/generate-image", async (req, res) => {
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ error: "imageUrl is required" });
  }

  const prompt = "Create ghibli style art";

  try {
    console.log("Calling generateFantasyImage...");
    const data = await generateFantasyImage(imageUrl, prompt, API_Key);
    console.log("Initial Response:", data);

    const statusUrl = data.status_url;
    if (!statusUrl) {
      return res
        .status(500)
        .json({ error: "status_url not found in response" });
    }

    console.log("Polling status_url:", statusUrl);
    const output = await pollStatusUrl(statusUrl, API_Key);

    if (!output || output.length === 0) {
      return res.status(500).json({ error: "No output found in response" });
    }

    res.json({
      message: "Image generation successful",
      output: output,
    });
  } catch (error) {
    console.error("Error during image generation:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Increase server timeout to 2 minutes
server.timeout = 300000;
