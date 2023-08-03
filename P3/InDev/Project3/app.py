from flask import Flask, render_template, request
import requests
import urllib.parse

app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = '1234'  # Replace with a secure secret key

# Function to fetch weather data
async def getWeatherData(lat, lon):
    apiKey = 'c04ea89d7fcd4a26b5b05602230108'  # WeatherAPI API key
    apiUrl = f'https://api.weatherapi.com/v1/current.json?key={apiKey}&q={lat},{lon}'

    try:
        response = await requests.get(apiUrl)
        data = response.json()
        return data
    except requests.RequestException as e:
        print('Error fetching weather data:', e)
        return None

# Function to fetch Yelp data
async def getYelpData(lat, lon):
    apiKey = 'nixqJQSmDWjtad9W7cRnmrIIGja8iunPIGWPKA8qh902AoXgpfUWSmSw1_SgiC9HFoZfxcf2PxNrzbUSn_n1m3oE2hUZAU6aCdvat1nElDCsEZ5LUsA5l4N7v1XIZHYx'  # Yelp Fusion API key
    apiUrl = f'https://api.yelp.com/v3/businesses/search?latitude={lat}&longitude={lon}&limit=10'

    try:
        response = await requests.get(apiUrl, headers={
            'Authorization': f'Bearer {apiKey}'
        })
        data = response.json()
        return data
    except requests.RequestException as e:
        print('Error fetching Yelp data:', e)
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
        # Fetch weather and Yelp data for the selected location
        weather_data = await getWeatherData(latitude, longitude)
        yelp_data = await getYelpData(latitude, longitude)

        # Process weather_data and yelp_data as needed
        # ...

    return render_template('results.html', weather_data=weather_data, yelp_data=yelp_data)

# Run the Flask app
if __name__ == '__main__':
    app.run()
