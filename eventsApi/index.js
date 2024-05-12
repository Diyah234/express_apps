const express = require("express");
const bodyParser = require("body-parser");
const { getJson } = require("serpapi");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public/")); // Serve static files from 'public' directory

// Import the countries array from countries.js
const countries = require("./Countries");

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post("/", function(req, res) {
    const query = req.body.state;
    const country = getCountryCode(query);

    if (!country) {
        return res.send("<h2>Invalid country name. Please try again.</h2>");
    }

    const url = `https://serpapi.com/search.json?engine=google_events&q=Events+in+${query}&hl=en&gl=${country}&api_key=d4d402df41402fdf67fb67d496f284d08891e51bdf599c066f162268852e4d4c`;

    getJson({
        engine: "google_events",
        q: query,
        hl: "en",
        gl: country,
        api_key: "d4d402df41402fdf67fb67d496f284d08891e51bdf599c066f162268852e4d4c"
    }, (json) => {
        try {
            if (json && json.events_results && json.events_results.length > 0) {
                const eventHtml = json.events_results.map(event => `
                    <div class="box">
                        <div class="image">${event.image ? `<img src="${event.image}" />` : ''}</div>
                        <h2>${event.title}</h2>
                        <p>${event.date.when}</p>
                        <p>${event.description}</p>
                        <a href="${event.link}">Link</a>
                    </div>
                `).join("");

                const fullHtmlResponse = `
                    <link rel="stylesheet" href="/css/style.css">
                    <h2>Events in ${query.toUpperCase()}</h2>
                    <div id="events-container">${eventHtml}</div>
                    <script>
                        document.addEventListener('DOMContentLoaded', function() {
                            const eventsContainer = document.getElementById('events-container');
                            eventsContainer.innerHTML = '${eventHtml}';
                        });
                    </script>
                `;
                res.send(fullHtmlResponse);
            } else {
                console.log("No events found");
                res.send("<h2>No events found</h2>");
            }
        } catch (error) {
            console.error("Error processing API response:", error);
            res.status(500).send("Internal Server Error");
        }
    });
});

function getCountryCode(query) {
    const normalizedQuery = query.trim().toLowerCase();
    const country = countries.find(country => country.country_name.toLowerCase() === normalizedQuery);
    return country ? country.country_code : null;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});
