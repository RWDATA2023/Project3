// script.js
// Initialize the map
const map = L.map('map').setView([0, 0], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Function to fetch weather data
async function getWeatherData(lat, lon) {
    const apiKey = 'c04ea89d7fcd4a26b5b05602230108'; // WeatherAPI API key
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${lat},${lon}`;

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

// Function to fetch Yelp data
async function getYelpData(lat, lon) {
    const apiKey = 'nixqJQSmDWjtad9W7cRnmrIIGja8iunPIGWPKA8qh902AoXgpfUWSmSw1_SgiC9HFoZfxcf2PxNrzbUSn_n1m3oE2hUZAU6aCdvat1nElDCsEZ5LUsA5l4N7v1XIZHYx'; // Yelp Fusion API key
    const apiUrl = `https://api.yelp.com/v3/businesses/search?latitude=${lat}&longitude=${lon}&limit=10`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                Authorization: `Bearer ${apiKey}`
            }
        });
        const data = await response.json();
        // Process the Yelp data and update the UI
        updateYelpUI(data);
    } catch (error) {
        console.error('Error fetching Yelp data:', error);
        // Handle error scenario and display a user-friendly message
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
        // Fetch weather and Yelp data for the selected location
        await getWeatherData(latitude, longitude);
        await getYelpData(latitude, longitude);
        // Call other APIs and update the UI accordingly
    }
});

// Function to update the UI with weather data
function updateWeatherUI(data) {
    const weatherInfo = data.current;
    const weatherContainer = document.getElementById('weatherContainer');

    // Display weather information on the web page
    weatherContainer.innerHTML = `
        <h2>Current Weather</h2>
        <p>Temperature: ${weatherInfo.temp_c}°C</p>
        <p>Condition: ${weatherInfo.condition.text}</p>
        <p>Wind: ${weatherInfo.wind_kph} km/h</p>
    `;
}

// Function to update the UI with Yelp data
function updateYelpUI(data) {
    const yelpContainer = document.getElementById('yelpContainer');
    yelpContainer.innerHTML = '<h2>Top 3 Restaurants</h2>';
    // Display top 3 restaurants based on rating
    data.businesses.sort((a, b) => b.rating - a.rating);
    for (let i = 0; i < 3 && i < data.businesses.length; i++) {
        const restaurant = data.businesses[i];
        yelpContainer.innerHTML += `
            <p>Name: ${restaurant.name}</p>
            <p>Rating: ${restaurant.rating}</p>
            <p>Address: ${restaurant.location.address1}</p>
        `;
    }

    yelpContainer.innerHTML += '<h2>Top 3 Hotels</h2>';
    // Display top 3 hotels based on rating
    data.businesses.sort((a, b) => b.rating - a.rating);
    for (let i = 0; i < 3 && i < data.businesses.length; i++) {
        const hotel = data.businesses[i];
        yelpContainer.innerHTML += `
            <p>Name: ${hotel.name}</p>
            <p>Rating: ${hotel.rating}</p>
            <p>Address: ${hotel.location.address1}</p>
        `;
    }
}

// ... (existing code)
