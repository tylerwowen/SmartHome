var http = require('http');

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
	host: 'api.nytimes.com',
	path: '/svc/topstories/v1/home.json?api-key=e850e4e7b13eaaccc3b2e2f30fb1f557:8:72181714'
};

callback = function(response) {
	var str = '';

	//another chunk of data has been recieved, so append it to `str`
	response.on('data', function(chunk) {
		str += chunk;
	});

	//the whole response has been recieved, so we just print it out here
	response.on('end', function() {
		var newsJson = JSON.parse(str);
		var outputStr = 'I have fetched the following top news from New York Times for you.\n';
		for (i = 0; i < 3; i++) {
			outputStr += 'News ' + (i+1) + ': ' + newsJson.results[i].title + '. \n' + newsJson.results[i].abstract + '. \n';
		}

		var fs = require('fs');
		fs.writeFile("./news.txt", outputStr, function(err) {
			if (err) {
				return console.log(err);
			}

			console.log("The file was saved!");
		});
		//console.log(str);
	});

};

http.request(options, callback).end();

