// Require the module 
var Forecast = require('forecast');
var fs = require('fs');

 
// Initialize 
var forecast = new Forecast({
  service: 'forecast.io',
  key: '68fc5c65dece562424d8f18711ae819d',
  units: 'fahrenheit', // Only the first letter is parsed 
  cache: true,      // Cache API requests? 
  ttl: {            // How long to cache requests. Uses syntax from moment.js: http://momentjs.com/docs/#/durations/creating/ 
    minutes: 27,
    seconds: 45
    }
});
 
// Retrieve weather information from coordinates (Sydney, Australia) 
forecast.get([34.4406,119.8136], function(err, weather) {
  if(err) return console.dir(err);
	var weatherText='';
	var maxTime = Math.floor((weather.daily.data[0].temperatureMaxTime/1000/60/60)%24)%12;
	if( maxTime ===12)
		maxTime = 12;
  	weatherText = 'Weather today in Goleta is: ' +weather.hourly.summary + ' with cloud coverage at ' + 
			  (weather.daily.data[0].cloudCover * 100) + ' percent. Highs today peak around ' + 
			  maxTime + ' pm at ' + Math.ceil(weather.daily.data[0].temperatureMax) + 
			  ' degrees fahrenheit. Wind speeds reach ' + Math.ceil(weather.daily.data[0].windSpeed) +
			  ' miles per hour and humidity today is at ' + (weather.daily.data[0].humidity * 100) + ' percent.\n';
	weatherText += 'We suggest you bring a light jacket when you go out today/';
	console.log(weatherText);

			fs.writeFile("weather.txt", weatherText, function(err) {
				if (err) {
					return console.log(err);
				}

				console.log("Weather file was saved! ");
			});
});
 
// Retrieve weather information, ignoring the cache 
/* forecast.get([34.4406,119.8136], true, function(err, weather) {
  if(err) return console.dir(err);
  console.dir(weather);
}); */