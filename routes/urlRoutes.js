const express = require("express");
const { nanoid } = require("nanoid");
const Url = require("../models/Url");

const router = express.Router();

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Create Short URL
router.post("/shorten", async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        success: false,
        message: "Original URL is required"
      });
    }

    if (!isValidUrl(originalUrl)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid URL"
      });
    }

    let existingUrl = await Url.findOne({ originalUrl });

    if (existingUrl) {
      return res.status(200).json({
        success: true,
        message: "URL already shortened",
        data: existingUrl
      });
    }

    const shortCode = nanoid(7);
    const shortUrl = `${process.env.BASE_URL}/${shortCode}`;

    const newUrl = await Url.create({
      originalUrl,
      shortCode,
      shortUrl
    });

    res.status(201).json({
      success: true,
      message: "Short URL created successfully",
      data: newUrl
    });
  } catch (error) {
    console.error("Shorten Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

// Get all URLs
router.get("/all", async (req, res) => {
  try {
    const urls = await Url.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: urls.length,
      data: urls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

// Delete URL
router.delete("/:id", async (req, res) => {
  try {
    const url = await Url.findById(req.params.id);

    if (!url) {
      return res.status(404).json({
        success: false,
        message: "URL not found"
      });
    }

    await Url.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "URL deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error"
    });
  }
});

module.exports = router;