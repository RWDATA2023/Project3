// script.js
// Initialize the map
const map = L.map('map').setView([0, 0], 12);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Translations for static texts
var translations = {
    en: {
        weatherForecast: "Weather Forecast for the Next Three Days",
        date: "Date",
        avgTemp: "Average Temperature",
        condition: "Condition",
        maxWindSpeed: "Max Wind Speed",
        placesOfInterest: "Places of Interest",
        closestAccommodations: "Closest 3 Accommodations",
        closestSights: "Closest 3 Sights",
        closestRestaurants: "Closest 3 Restaurants"
    },
    es: {
        weatherForecast: "Pronóstico del tiempo para los próximos tres días",
        date: "Fecha",
        avgTemp: "Temperatura promedio",
        condition: "Condición",
        maxWindSpeed: "Velocidad máxima del viento",
        placesOfInterest: "Lugares de interés",
        closestAccommodations: "3 alojamientos más cercanos",
        closestSights: "3 vistas más cercanas",
        closestRestaurants: "3 restaurantes más cercanos"
    },
    fr: {
        weatherForecast: "Prévisions météo pour les trois prochains jours",
        date: "Date",
        avgTemp: "Température moyenne",
        condition: "Condition",
        maxWindSpeed: "Vitesse maximale du vent",
        placesOfInterest: "Lieux d'intérêt",
        closestAccommodations: "3 hébergements les plus proches",
        closestSights: "3 sites les plus proches",
        closestRestaurants: "3 restaurants les plus proches"
    },
    it: {
        weatherForecast: "Previsioni meteo per i prossimi tre giorni",
        date: "Data",
        avgTemp: "Temperatura media",
        condition: "Condizione",
        maxWindSpeed: "Velocità massima del vento",
        placesOfInterest: "Luoghi di interesse",
        closestAccommodations: "3 alloggi più vicini",
        closestSights: "3 siti più vicini",
        closestRestaurants: "3 ristoranti più vicini"
    },
    de: {
        weatherForecast: "Wettervorhersage für die nächsten drei Tage",
        date: "Datum",
        avgTemp: "Durchschnittstemperatur",
        condition: "Zustand",
        maxWindSpeed: "Maximale Windgeschwindigkeit",
        placesOfInterest: "Sehenswürdigkeiten",
        closestAccommodations: "3 nächstgelegene Unterkünfte",
        closestSights: "3 nächstgelegene Sehenswürdigkeiten",
        closestRestaurants: "3 nächstgelegene Restaurants"
    }
};

// Function to handle language change
function changeLanguage() {
    var language = document.getElementById('language').value;
    const { lat, lng } = map.getCenter();
    getWeatherData(lat, lng, language);
}

// Function to fetch weather data including forecast for the next three days in imperial units
async function getWeatherData(lat, lon, language) {
    const apiKey = 'c04ea89d7fcd4a26b5b05602230108'; // WeatherAPI API key
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=3&units=imperial`;

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        updateWeatherUI(data, language);
    } catch (error) {
        console.error('Error fetching weather data:', error);
    }
}

// Function to update the UI with weather data
function updateWeatherUI(data, language) {
    const weatherContainer = document.getElementById('weatherContainer');
    weatherContainer.innerHTML = `<h2>${translations[language]['weatherForecast']}</h2>`;
    for (let i = 0; i < 3 && i < data.forecast.forecastday.length; i++) {
        const forecast = data.forecast.forecastday[i].day;
        weatherContainer.innerHTML += `
            <h3>Day ${i + 1}</h3>
            <p>${translations[language]['date']}: ${data.forecast.forecastday[i].date}</p>
            <p>${translations[language]['avgTemp']}: ${forecast.avgtemp_c}°C</p>
            <p>${translations[language]['condition']}: ${forecast.condition.text}</p>
            <p>${translations[language]['maxWindSpeed']}: ${forecast.maxwind_kph} km/h</p>
        `;
    }
}

// Event listener for the search button
document.getElementById('searchButton').addEventListener('click', async () => {
    const location = document.getElementById('searchInput').value;
    if (location.trim() === '') {
        console.error('Location name cannot be empty.');
        return;
    }
    const coordinates = await getLocationCoordinates(location);
    if (coordinates) {
        const { latitude, longitude } = coordinates;
        map.setView([latitude, longitude], 12);
        var language = document.getElementById('language').value;
        await getWeatherData(latitude, longitude, language);
        const accommodationsData = await getGeoapifyData(latitude, longitude, 'accommodation.hotel');
        const sightsData = await getGeoapifyData(latitude, longitude, 'entertainment.culture');
        const foodAndDrinkData = await getGeoapifyData(latitude, longitude, 'catering.restaurant');
        updateGeoapifyUI(accommodationsData, sightsData, foodAndDrinkData);
    }
});

// Function to update the UI with Geoapify data for Accommodations, Sights, and Food & Drink
function updateGeoapifyUI(accommodationsData, sightsData, foodAndDrinkData) {
    const geoapifyContainer = document.getElementById('geoapifyContainer');
    geoapifyContainer.innerHTML = '<h2>Places of Interest</h2>';
    addMarkersAndData(accommodationsData, 'Accommodations');
    addMarkersAndData(sightsData, 'Sights');
    addMarkersAndData(foodAndDrinkData, 'Restaurants');
}

// Function to add markers to the map and update Geoapify container based on Geoapify data
function addMarkersAndData(geoapifyData, category) {
    if (geoapifyData && geoapifyData.features.length > 0) {
        const geoapifyContainer = document.getElementById('geoapifyContainer');
        geoapifyContainer.innerHTML += `<h3>Closest 3 ${category}</h3>`;
        geoapifyData.features.forEach(place => {
            var marker = L.marker([place.geometry.coordinates[1], place.geometry.coordinates[0]]).addTo(map);
            var popupContent = `
                <div class="popup">
                    <h3>${place.properties.name}</h3>
                    <p>${place.properties.formatted}</p>
                </div>
            `;
            marker.bindPopup(popupContent);
            geoapifyContainer.innerHTML += popupContent;
        });
    }
}

// Function to fetch Geoapify data for Accommodations, Sights, and Food & Drink
async function getGeoapifyData(lat, lon, category) {
    const apiKey = 'c60a9acdc1984edeb402b29ad11381bd'; // Geoapify API key
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
        }
    } catch (error) {
        console.error('Error fetching location data:', error);
    }
}

async function updateWeatherLanguage() {
    const language = document.getElementById('language').value;
    try {
        const response = await fetch(`/update_weather_language?language=${language}`);
        const data = await response.json();
        updateWeatherUI(data, language);
    } catch (error) {
        console.error('Error updating weather language:', error);
    }
}

// Event listener for language selector
document.getElementById('language').addEventListener('change', updateWeatherLanguage);
