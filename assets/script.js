const foreCast = document.getElementById('forecast');
const fetchButton = document.getElementById('fetch-btn');
const weatherDataArray = [];
const fetchBtn = document.getElementById('fetch-btn');
const searchInput = document.getElementById('search-bar');
// const apiKey = process.env.API-KEY;
const date = new Date();
let day = date.getDate();
let month = date.getMonth() + 1;
let year = date.getFullYear();
let currentDate = `${month}/${day}/${year}`;

function renderCityButton(cityName) {
    const cityButton = document.createElement('button');
    cityButton.classList.add('btn', 'btn-primary', 'style-btn');
    cityButton.type = 'button';
    cityButton.textContent = cityName;
    cityButton.addEventListener('click', () => {
        searchInput.value = cityName;
        fetchWeather(cityName);
    });
    document.querySelector('.my-form-class .d-grid').appendChild(cityButton);
}


// To fetch and display weather data
// Accept user input for city name, convert to geographic coordinates using OpenWeather API, then fetch weather forecast
// Display weather in two areas: current weather on top and 5-day forecast on individual cards below
// Save the city weather data to local storage and create a button for it 
function fetchWeather(cityInput) {
    const punctuationless = cityInput.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
    const finalString = punctuationless.replace(/\s{2,}/g, " ");
    const cityInputSpliced = finalString.split(' ');
    const userCityInput = cityInputSpliced[0];
    const userStateInput = cityInputSpliced[1] || '';
    const userCountryInput = cityInputSpliced[2] || '';

    const cityConvertToGeo = `https://api.openweathermap.org/geo/1.0/direct?q=${userCityInput},${userStateInput},${userCountryInput}&limit=5&appid=1032d99e11ef3e77475aff7cae477682`;

    fetch(cityConvertToGeo)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const cityLat = data[0].lat;
                const cityLong = data[0].lon;

                const fetchURL = `https://api.openweathermap.org/data/2.5/forecast?lat=${cityLat}&lon=${cityLong}&units=imperial&appid=1032d99e11ef3e77475aff7cae477682`;
                return fetch(fetchURL);
            } else {
                throw new Error('No coordinates found for given city');
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log('API Data:', data);

            if (data) {
                const currentWeather = data.list[0];
                const currentTemp = currentWeather.main.temp;
                const currentWind = currentWeather.wind.speed;
                const currentHumidity = currentWeather.main.humidity;
                const currentIcon = currentWeather.weather[0].icon;
                const currentCity = data.city.name;

                // Update current weather
                const topWeatherBox = document.getElementById('top-row');
                topWeatherBox.innerHTML = `
                    <div>
                        <h2>${currentCity} ${currentDate}</h2>
                        <img src="https://openweathermap.org/img/wn/${currentIcon}@2x.png" alt="Weather icon">
                        <p>Temp: ${currentTemp} °F</p>
                        <p>Wind: ${currentWind} mph</p>
                        <p>Humidity: ${currentHumidity} %</p>
                    </div>
                `;

                // Update 5-day forecast
                const forecastContainer = document.getElementById('uniqueBox');
                forecastContainer.innerHTML = '';

                const dayIndices = [7, 15, 23, 31, 39]; // Indices for roughly each day at 24-hour intervals

                dayIndices.forEach((index, i) => {
                    if (data.list[index]) {
                        const forecast = data.list[index];
                        const forecastTemp = forecast.main.temp;
                        const forecastWind = forecast.wind.speed;
                        const forecastHumidity = forecast.main.humidity;
                        const forecastIcon = forecast.weather[0].icon;
                        const forecastDate = new Date(forecast.dt * 1000).toLocaleDateString();

                        forecastContainer.innerHTML += `
                            <div class="card" style="width: 10rem;">
                                <div class="card-body">
                                    <h5 class="card-title">${forecastDate}</h5>
                                    <img src="https://openweathermap.org/img/wn/${forecastIcon}@2x.png" alt="Weather icon">
                                    <p class="card-text">Temp: ${forecastTemp} °F</p>
                                    <p class="card-text">Wind: ${forecastWind} mph</p>
                                    <p class="card-text">Humidity: ${forecastHumidity} %</p>
                                </div>
                            </div>
                        `;
                    } else {
                        console.error(`Forecast data for index ${index} is not available`);
                    }
                });

                // Store city and render button if not already stored
                const storedCities = JSON.parse(localStorage.getItem('weatherDataArray')) || [];
                if (!storedCities.some(cityData => cityData.city === currentCity)) {
                    storedCities.push({ city: currentCity });
                    localStorage.setItem('weatherDataArray', JSON.stringify(storedCities));
                    renderCityButton(currentCity);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// To initialize the application
// Retrieve stored city data from local storage and set up event listeners
// Render buttons for previously searched cities
function getApi() {
    const retrievedArray = JSON.parse(localStorage.getItem('weatherDataArray')) || [];

    console.log(retrievedArray);
    fetchBtn.addEventListener('click', function () {
        const cityInput = searchInput.value;
        fetchWeather(cityInput);
    });

// To iterate over each city data object stored in retrievedArray
// Extract city name and create a button for each city
    retrievedArray.forEach(cityData => renderCityButton(cityData.city));
}

getApi();
