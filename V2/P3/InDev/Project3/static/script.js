// script.js
// Initialize the map
const map = L.map('map').setView([0, 0], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Function to fetch weather data including forecast for the next three days in imperial units
async function getWeatherData(lat, lon) {
    const apiKey = 'c04ea89d7fcd4a26b5b05602230108'; // WeatherAPI API key
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3&units=imperial`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        // Process the weather data and update the UI
        updateWeatherUI(data);
    } catch (error) {
        console.error('Error fetching weather data:', error);
        // Handle error scenario and display a user-friendly message
    }
}

// Function to fetch Geoapify data for Accommodations, Sights, and Food & Drink
async function getGeoapifyData(lat, lon, category) {
    const apiKey = 'c60a9acdc1984edeb402b29ad11381bd'; // Replace with your Geoapify API key
    const apiUrl = `https://api.geoapify.com/v2/places?categories=${category}&bias=proximity:${lon},${lat}&limit=3&apiKey=${apiKey}`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching Geoapify data:', error);
        return null;
    }
}

// Function to convert location name to coordinates using LocationIQ API
async function getLocationCoordinates(location) {
    const apiKey = 'pk.1628022f589a6bec5a2e4b2e449d83b1'; // LocationIQ API key
    const apiUrl = `https://us1.locationiq.com/v1/search.php?key=${apiKey}&q=${encodeURIComponent(location)}&format=json`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.length > 0) {
            const { lat, lon } = data[0];
            return { latitude: lat, longitude: lon };
        } else {
            console.error('Location not found:', location);
            // Handle location not found scenario and display a user-friendly message
        }
    } catch (error) {
        console.error('Error fetching location data:', error);
        // Handle error scenario and display a user-friendly message
    }
}

// Event listener for the search button
document.getElementById('searchButton').addEventListener('click', async () => {
    const location = document.getElementById('searchInput').value;
    if (location.trim() === '') {
        console.error('Location name cannot be empty.');
        // Handle empty location name scenario and display a user-friendly message
        return;
    }
    // Use LocationIQ to convert location name to latitude and longitude
    const coordinates = await getLocationCoordinates(location);
    if (coordinates) {
        const { latitude, longitude } = coordinates;
        // Update the map
        map.setView([latitude, longitude], 12);
        // Fetch weather data for the selected location
        await getWeatherData(latitude, longitude);
        // Fetch Geoapify data for Accommodations, Sights, and Food & Drink for the selected location
        const accommodationsData = await getGeoapifyData(latitude, longitude, 'accommodation.hotel');
        const sightsData = await getGeoapifyData(latitude, longitude, 'entertainment.culture');
        const foodAndDrinkData = await getGeoapifyData(latitude, longitude, 'catering.restaurant');
        // Call other APIs and update the UI accordingly
        updateGeoapifyUI(accommodationsData, sightsData, foodAndDrinkData);
    }
});

// Function to update the UI with weather data
function updateWeatherUI(data) {
    const weatherContainer = document.getElementById('weatherContainer');
    weatherContainer.innerHTML = '<h2>Weather Forecast for the Next Three Days</h2>';

    for (let i = 0; i < 3 && i < data.forecast.forecastday.length; i++) {
        const forecast = data.forecast.forecastday[i].day;
        weatherContainer.innerHTML += `
            <h3>Day ${i + 1}</h3>
            <p>Date: ${data.forecast.forecastday[i].date}</p>
            <p>Average Temperature: ${forecast.avgtemp_c}°C</p>
            <p>Condition: ${forecast.condition.text}</p>
            <p>Max Wind Speed: ${forecast.maxwind_kph} km/h</p>
        `;
    }
}

// Function to update the UI with Geoapify data for Accommodations, Sights, and Food & Drink
function updateGeoapifyUI(accommodationsData, sightsData, foodAndDrinkData) {
    const geoapifyContainer = document.getElementById('geoapifyContainer');
    geoapifyContainer.innerHTML = '<h2>Top 3 Accommodations</h2>';
    if (accommodationsData && accommodationsData.features.length > 0) {
        accommodationsData.features.forEach((place, index) => {
            geoapifyContainer.innerHTML += `
                <p>${index + 1}. ${place.properties.name}</p>
                <p>Address: ${place.properties.formatted}</p>
            `;
        });
    } else {
        geoapifyContainer.innerHTML += '<p>No accommodations found.</p>';
    }

    geoapifyContainer.innerHTML += '<h2>Top 3 Sights</h2>';
    if (sightsData && sightsData.features.length > 0) {
        sightsData.features.forEach((place, index) => {
            geoapifyContainer.innerHTML += `
                <p>${index + 1}. ${place.properties.name}</p>
                <p>Address: ${place.properties.formatted}</p>
            `;
        });
    } else {
        geoapifyContainer.innerHTML += '<p>No sights found.</p>';
    }

    geoapifyContainer.innerHTML += '<h2>Top 3 Food & Drink</h2>';
    if (foodAndDrinkData && foodAndDrinkData.features.length > 0) {
        foodAndDrinkData.features.forEach((place, index) => {
            geoapifyContainer.innerHTML += `
                <p>${index + 1}. ${place.properties.name}</p>
                <p>Address: ${place.properties.formatted}</p>
            `;
        });
    } else {
        geoapifyContainer.innerHTML += '<p>No food & drink places found.</p>';
    }
}

// ... (existing code)
