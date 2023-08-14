from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import requests
import urllib.parse
import sqlite3

app = Flask(__name__, static_folder='static')
app.config['SECRET_KEY'] = '1234'

CORS(app)  

def getWeatherData(lat, lon):
    apiKey = 'c04ea89d7fcd4a26b5b05602230108'
    apiUrl = f'https://api.weatherapi.com/v1/forecast.json?key={apiKey}&q={lat},{lon}&days=3&units=imperial'
    try:
        response = requests.get(apiUrl)
        data = response.json()
        return data
    except requests.RequestException as e:
        print('Error fetching weather data:', e)
        return None

def getLocationCoordinates(location):
    apiKey = 'pk.1628022f589a6bec5a2e4b2e449d83b1'
    apiUrl = f'https://us1.locationiq.com/v1/search.php?key={apiKey}&q={urllib.parse.quote(location)}&format=json'
    try:
        response = requests.get(apiUrl)
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

def translate_weather_conditions(weather_data, language):
    conn = sqlite3.connect('data/weather_conditions.db')
    cursor = conn.cursor()

    # Function to translate a specific condition
    def translate_condition(condition_text):
        query = f"SELECT {language} FROM weather_conditions WHERE en = ?"
        translation = cursor.execute(query, (condition_text,)).fetchone()
        return translation[0] if translation else condition_text

    # Translating current condition
    condition_text_current = weather_data['current']['condition']['text']
    weather_data['current']['condition']['text'] = translate_condition(condition_text_current)

    # Translating forecast conditions
    for forecast in weather_data['forecast']['forecastday']:
        condition_text = forecast['day']['condition']['text']
        forecast['day']['condition']['text'] = translate_condition(condition_text)

    conn.close()
    return weather_data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    location = request.form['location']
    if not location.strip():
        return 'Location name cannot be empty.'
    latitude, longitude = getLocationCoordinates(location)
    if latitude is not None and longitude is not None:
        weather_data = getWeatherData(latitude, longitude)
        language = 'en'
        weather_data = translate_weather_conditions(weather_data, language)
        # ... rest of the code ...
    return render_template('results.html', weather_data=weather_data, accommodations_data=accommodations_data, sights_data=sights_data, food_and_drink_data=food_and_drink_data)

@app.route('/update_weather_language')
def update_weather_language():
    language = request.args.get('language')
    # Fetch weather conditions data from the database using the language
    weather_data = fetch_weather_conditions_from_db(language)
    return jsonify(weather_data)

if __name__ == '__main__':
    app.run()
