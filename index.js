require("dotenv").config();
const bodyParser = require("body-parser");
const dns = require("dns");
const express = require("express");
const cors = require("cors");
const { url } = require("inspector");
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// In-memory database to store URLs
const urlDatabase = {};
let nextId = 1;

//  to validate a URL using dns.lookup
const validateUrl = (url, callback) => {
  const parsedUrl = new URL(url);
  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      callback(false);
    } else {
      callback(true);
    }
  });
};

// API endpoint to shorten a URL
app.post("/api/shorturl", (req, res) => {
  const { url } = req.body;

  validateUrl(url, (isValid) => {
    if (!isValid) {
      return res.json({ error: "invalid url" });
    }

    // Generate short URL
    const shortUrl = nextId++;
    urlDatabase[shortUrl] = url;

    return res.json({ original_url: url, short_url: shortUrl });
  });
});
app.get("/api/shorturl/:shortUrl", (req, res) => {
  const shortUrl = parseInt(req.params.shortUrl);
  const originalUrl = urlDatabase[shortUrl];
  if (!originalUrl) {
    res.status(404).json({ error: "invalid url" });
  }
  return res.redirect(originalUrl);
});
app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
