from flask import Flask, render_template, request
import requests
import urllib.parse

app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = '1234'  # Replace with a secure secret key

# Function to fetch weather data
async def getWeatherData(lat, lon):
    apiKey = 'c04ea89d7fcd4a26b5b05602230108'  # WeatherAPI API key
    apiUrl = f'https://api.weatherapi.com/v1/forecast.json?key={apiKey}&q={lat},{lon}&days=3&units=imperial'

    try:
        response = await requests.get(apiUrl)
        data = response.json()
        return data
    except requests.RequestException as e:
        print('Error fetching weather data:', e)
        return None

# Function to fetch Geoapify data for accommodations
async def getAccommodationsData(lat, lon):
    apiKey = 'c60a9acdc1984edeb402b29ad11381bd'  # Replace with your Geoapify API key
    category = 'accommodation.hotel'
    radius = 2000
    apiUrl = f'https://api.geoapify.com/v2/places?categories={category}&filter=circle:{lon},{lat},{radius}&limit=3&apiKey={apiKey}'

    try:
        response = await requests.get(apiUrl)
        data = response.json()
        return data
    except requests.RequestException as e:
        print('Error fetching accommodations data:', e)
        return None

# Function to fetch Geoapify data for sights
async def getSightsData(lat, lon):
    apiKey = 'c60a9acdc1984edeb402b29ad11381bd'  # Replace with your Geoapify API key
    category = 'tourism.sights'
    radius = 2000
    apiUrl = f'https://api.geoapify.com/v2/places?categories={category}&filter=circle:{lon},{lat},{radius}&limit=3&apiKey={apiKey}'

    try:
        response = await requests.get(apiUrl)
        data = response.json()
        return data
    except requests.RequestException as e:
        print('Error fetching sights data:', e)
        return None

# Function to fetch Geoapify data for food and drink
async def getFoodAndDrinkData(lat, lon):
    apiKey = 'c60a9acdc1984edeb402b29ad11381bd'  # Replace with your Geoapify API key
    category = 'commercial.food_and_drink'
    radius = 2000
    apiUrl = f'https://api.geoapify.com/v2/places?categories={category}&filter=circle:{lon},{lat},{radius}&limit=3&apiKey={apiKey}'

    try:
        response = await requests.get(apiUrl)
        data = response.json()
        return data
    except requests.RequestException as e:
        print('Error fetching food and drink data:', e)
        return None

# Function to convert location name to coordinates using LocationIQ API
async def getLocationCoordinates(location):
    apiKey = 'pk.1628022f589a6bec5a2e4b2e449d83b1'  # LocationIQ API key
    apiUrl = f'https://us1.locationiq.com/v1/search.php?key={apiKey}&q={urllib.parse.quote(location)}&format=json'

    try:
        response = await requests.get(apiUrl)
        data = response.json()
        if len(data) > 0:
            latitude = data[0]['lat']
            longitude = data[0]['lon']
            return latitude, longitude
        else:
            return None, None
    except requests.RequestException as e:
        print('Error fetching location data:', e)
        return None, None

# Home route - Serve the index.html template
@app.route('/')
def index():
    return render_template('index.html')

# Search route - Handle search requests from the form
@app.route('/search', methods=['POST'])
async def search():
    location = request.form['location']
    if not location.strip():
        return 'Location name cannot be empty.'

    # Use LocationIQ to convert location name to latitude and longitude
    latitude, longitude = await getLocationCoordinates(location)
    if latitude is not None and longitude is not None:
        # Fetch weather and Geoapify data for the selected location
        weather_data = await getWeatherData(latitude, longitude)
        accommodations_data = await getAccommodationsData(latitude, longitude)
        sights_data = await getSightsData(latitude, longitude)
        food_and_drink_data = await getFoodAndDrinkData(latitude, longitude)

        # Process weather_data, accommodations_data, sights_data, and food_and_drink_data as needed
        # ...

    return render_template('results.html', weather_data=weather_data, accommodations_data=accommodations_data, sights_data=sights_data, food_and_drink_data=food_and_drink_data)

# Run the Flask app
if __name__ == '__main__':
    app.run()
