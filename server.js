const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

const app = express();
const port = 3000;

// Endpoint for scraping and returning the data
app.get('/maintenance', (req, res) => {
  // URL of the website to scrape
  const url = 'https://statuspage.hostinger.com/';

  // Send a GET request to the URL
  axios.get(url)
    .then(response => {
      // Load the response data into Cheerio
      const $ = cheerio.load(response.data);

      // Find all the div elements with class "scheduled-maintenance"
      const divElements = $('.scheduled-maintenance');

      // Create an array to store the extracted information
      const data = [];

      // Loop through each div element and extract the desired information
      divElements.each((index, element) => {
        const div = $(element);

        // Extract the incident title and URL
        const incidentTitleElement = div.find('.incident-title a');
        const incidentTitle = incidentTitleElement.text().trim();
        const incidentUrl = incidentTitleElement.attr('href');

        // Extract the maintenance details
        const maintenanceDetailsElement = div.find('.update span');
        const maintenanceDetails = maintenanceDetailsElement.text().trim();

        // Extract the maintenance date and time
        const maintenanceDateElement = div.find('.pull-right');
        const maintenanceDate = maintenanceDateElement.text().trim();

        // Extract the posted date and time
        const postedOnElement = div.find('.update small .ago');
        const postedOn = postedOnElement.next().text().trim().split('-')[0].trim();

        // Extract the posted date
        const postedDateElement = postedOnElement.nextAll('var[data-var="date"]');
        const postedDate = postedDateElement.text().trim();

        // Extract the posted year
        const postedYearElement = postedDateElement.nextAll('var[data-var="year"]');
        const postedYear = postedYearElement.text().trim();

        // Extract the posted time
        const postedTimeElement = postedOnElement.next('var[data-var="time"]');
        const postedTime = postedTimeElement.text().trim();

        // Create an object for the extracted information
        const info = {
          'Title': incidentTitle,
          'URL': incidentUrl,
          'Details': maintenanceDetails,
          'Date': maintenanceDate,
          'Posted': `${postedOn} ${postedDate}, ${postedYear} - ${postedTime} UTC`
        };

        // Push the object to the data array
        data.push(info);
      });

      // Return the scraped data as JSON
      res.json(data);
    })
    .catch(error => {
      console.log('Error:', error);
      res.status(500).send('An error occurred while scraping the data.');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
