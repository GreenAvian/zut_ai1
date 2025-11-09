document.addEventListener("DOMContentLoaded", () => {
    const WeatherApp = class {
        
        constructor(apiKey, resultsBlockSelector) {
            this.apiKey = apiKey;
            this.currentWeatherLink = "https://api.openweathermap.org/data/2.5/weather?q={query}&appid={apiKey}&units=metric&lang=pl";
            this.forecastLink = "https://api.openweathermap.org/data/2.5/forecast?q={query}&appid={apiKey}&units=metric&lang=pl";

            this.currentWeatherLink = this.currentWeatherLink.replace("{apiKey}", this.apiKey);
            this.forecastLink = this.forecastLink.replace("{apiKey}", this.apiKey);

            this.currentWeather = undefined;
            this.forecast = undefined;

            this.resultsBlock = document.getElementById(resultsBlockSelector);
        }

        filterCurrentData(rawData) {
            return {
                location: {
                    city: rawData.name,
                    country: rawData.sys.country
                },
                
                main: {
                    date: new Date(rawData.dt * 1000),
                    temperature: Math.round(rawData.main.temp),
                    feels_like: Math.round(rawData.main.feels_like),
                    main: rawData.weather[0].main,
                    description: rawData.weather[0].description,
                    icon: rawData.weather[0].icon
                },
            };
        }

        filterForecastData(rawData) {
            return {
                location: {
                    city: rawData.city.name,
                    country: rawData.city.country
                },
                
                //Get the whole list
                forecast: rawData.list.map(forecastItem => {
                    return {
                        main: {
                            date: new Date(forecastItem.dt * 1000),
                            temperature: Math.round(forecastItem.main.temp),
                            feels_like: Math.round(forecastItem.main.feels_like),
                            description: forecastItem.weather[0].description,
                            icon: forecastItem.weather[0].icon
                        },
                    };
                })
            };
        }

        
        getCurrentWeather(query) {
            let url = this.currentWeatherLink.replace("{query}", query);
            let req = new XMLHttpRequest();
            req.open("GET", url, true);
            req.addEventListener("load", () => {
                this.currentWeather = JSON.parse(req.responseText);
                console.log(this.currentWeather);
                this.drawWeather(this.filterCurrentData(this.currentWeather));
            });
            req.send();
        }

        get5DayForecast(query) {
            let url = this.forecastLink.replace("{query}", query);
            fetch(url).then((response) => {
                return response.json();
            }).then((data) => {
                console.log(data);
                this.forecast = data;
                // this.forecast = data.list;
                this.drawWeather(this.filterForecastData(this.forecast));
            });
        }

        drawWeather(filteredData) {       
            
            if (filteredData.forecast) {
                this.drawForecastWeather(filteredData);
            } else {
                this.drawCurrentWeather(filteredData);
            }
        }
        
        drawCurrentWeather(filteredData) {
            const resultsBlock = document.getElementById("current_results");
            resultsBlock.innerHTML = "";
            const weatherBox = this.createWeatherBox(filteredData, filteredData.main);
            resultsBlock.appendChild(weatherBox);
            console.log(weatherBox.innerHTML);
        }
        
        drawForecastWeather(filteredData) {            
            const resultsBlock = document.getElementById("forecast_results");
            resultsBlock.innerHTML = "";
            filteredData.forecast.forEach(forecastPeriod => {
                const weatherBox = this.createWeatherBox(filteredData, forecastPeriod.main);
                resultsBlock.appendChild(weatherBox);
            });
            
        }
        
        createWeatherBox(locationData, weatherData) {
            const weatherBox = document.createElement('div');
            weatherBox.className = 'weather_result_box';
        
            const dateHeader = document.createElement('h2');
            dateHeader.className = 'weather_result_header';
            dateHeader.textContent = weatherData.date.toLocaleString('pl-PL', {
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        
            //Get weather icon
            if (weatherData.icon) {
                const weatherIcon = document.createElement('img');
                weatherIcon.className = 'leftside_icon';
                weatherIcon.src = `https://openweathermap.org/img/wn/${weatherData.icon}@2x.png`;
                weatherIcon.alt = 'ikona pogody';
                weatherBox.appendChild(weatherIcon);
            }
        
            const rightSideWrapper = document.createElement('div');
            rightSideWrapper.className = 'weather_result_rightside wrapper';

            const tempHeader = document.createElement('h2');
            tempHeader.className = 'weather_result_temp';
            tempHeader.textContent = `${weatherData.temperature}°C`;
        
            const feelsLike = document.createElement('p');
            feelsLike.className = 'weather_result_temp';
            feelsLike.innerHTML = `Odczuwalna: ${weatherData.feels_like}°C<br>${weatherData.description}`;
        
            rightSideWrapper.appendChild(tempHeader);
            rightSideWrapper.appendChild(feelsLike);
        
            weatherBox.appendChild(dateHeader);
            weatherBox.appendChild(rightSideWrapper);
        
            return weatherBox;
        }
    }
    
    document.weatherApp = new WeatherApp("1d96535f6ddfba1b9d5b6b280025a11e", "weather_results_wrapper");
    // document.getElementById("weatherGet").addEventListener("click", save_raster);

    document.getElementById("currentGet").addEventListener("click", function() {
        const query = document.getElementById("locationInput").value;
        document.weatherApp.getCurrentWeather(query);
    });

    document.getElementById("forecastGet").addEventListener("click", function() {
        const query = document.getElementById("locationInput").value;
        document.weatherApp.get5DayForecast(query);
    });

});