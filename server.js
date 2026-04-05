const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get("/departures", async (req, res) => {
  const stop = req.query.stop;
  if (!stop) return res.status(400).json({ error: "Missing stop parameter" });

  try {
    const url = `https://idos.cz/ustinadlabem/odjezdy/vysledky/?f=${encodeURIComponent(stop)}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const departures = [];
    $("tr.dep-row").each((i, el) => {
      const cells = $(el).find("td");
	  
      const destination = $(cells[0]).find("h3").text().trim();
      const line = $(cells[1]).find("h3").first().text().trim();
	  
      const timeRaw = $(cells[2]).find("h3").text().trim();
	  const timeMatch = timeRaw.match(/\d{1,2}:\d{2}/);
	  const time = timeMatch ? timeMatch[0] : timeRaw;
	  
      if (time && line) departures.push({ line, destination, time });
    });

    res.json({ stop, departures });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch departures" });
  }
});

app.listen(PORT, '0.0.0.0', () => console.log("Node server running on port 3000"));