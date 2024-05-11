const express = require("express");
const bodyParser = require("body-parser");
const { getJson } = require("serpapi");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public")); // Serve static files from 'public' directory

app.get("/", function(req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post("/", function(req, res) {
    const query = req.body.state;

    // Use SerpApi to fetch event search results
    getJson({
        engine: "google_events",
        q: query,
        hl: "en",
        gl: "us",
        api_key: "d4d402df41402fdf67fb67d496f284d08891e51bdf599c066f162268852e4d4c"
    }, (json) => {
        try {
            console.log(json["events_results"]); // Log the events results to console
            
            if (json && json.events_results && json.events_results.length > 0) {
                // Prepare HTML for displaying events
                const eventHtml = json.events_results.map(event => {
                    const imageUrl = event.image || '/images/default-image.jpg';
                    return `
                        <div class="box">
                            ${event.image ? `<div class="image"><img src="${imageUrl}" /></div>` : ''}
                            <h2>${event.title}</h2>
                            <p>${event.date.when}</p>
                            <p>${event.description}</p>
                            <a href="${event.link}">Link</a>
                        </div>
                    `;
                }).join("");

                // Send HTML response with events
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
                // No events found
                const defaultHtmlResponse = `
                    <link rel="stylesheet" href="/css/style.css">
                    <h2>No events found for ${query.toUpperCase()}</h2>
                    <p>Sorry, no events are currently available for ${query.toUpperCase()}.</p>
                `;
                res.send(defaultHtmlResponse);
            }
        } catch (error) {
            console.error("Error processing API response:", error);
            res.status(500).send("Internal Server Error");
        }
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, function() {
    console.log(`Server is running on port ${PORT}`);
});
