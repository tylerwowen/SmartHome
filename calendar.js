var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');
var calendar = google.calendar('v3');
var moment = require('moment');
var gm = require('googlemaps');
//var fs = require('fs');

var SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
	process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'calendar-api-quickstart.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
	if (err) {
		console.log('Error loading client secret file: ' + err);
		return;
	}
	// Authorize a client with the loaded credentials, then call the Calendar API.
	authorize(JSON.parse(content), getEvents);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
	var clientSecret = credentials.installed.client_secret;
	var clientId = credentials.installed.client_id;
	var redirectUrl = credentials.installed.redirect_uris[0];
	var auth = new googleAuth();
	var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

	// Check if we have previously stored a token.
	fs.readFile(TOKEN_PATH, function(err, token) {
		if (err) {
			getNewToken(oauth2Client, callback);
		} else {
			oauth2Client.credentials = JSON.parse(token);
			callback(oauth2Client);
		}
	});
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
	var authUrl = oauth2Client.generateAuthUrl({
		access_type: 'offline',
		scope: SCOPES
	});
	console.log('Authorize this app by visiting this url: ', authUrl);
	var rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
	rl.question('Enter the code from that page here: ', function(code) {
		rl.close();
		oauth2Client.getToken(code, function(err, token) {
			if (err) {
				console.log('Error while trying to retrieve access token', err);
				return;
			}
			oauth2Client.credentials = token;
			storeToken(token);
			callback(oauth2Client);
		});
	});
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
	try {
		fs.mkdirSync(TOKEN_DIR);
	} catch (err) {
		if (err.code != 'EEXIST') {
			throw err;
		}
	}
	fs.writeFile(TOKEN_PATH, JSON.stringify(token));
	console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Gets the next 10 events on the user's primary calendar.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function getEvents(auth) {

	var today = moment().format('LT');
	//console.log('today: %s', today);
	var txt = '';
	var reminder = '';
	var location = '';
	var time = 0;
	//var eventHour = '';
	calendar.events.list({
		auth: auth,
		calendarId: 'primary',
		singleEvents: true,
		timeMin: (new Date()).toISOString(),
		timeMax: (new Date(new Date().getTime() + 24 * 60 * 60 * 1000)).toISOString(),
		maxResults: 10,
		orderBy: 'startTime'
	}, function(err, response) {
		if (err) {
			console.log('There was an error contacting the Calendar service: ' + err);
			return;
		}
		var events = response.items;
		if (events.length === 0) {
			console.log('No upcoming events found.');
		} else {
			var currentHour = moment().hour();
			if (moment().hour() < 11 && moment().hour() > 4) {
				txt += 'Good Morning ' + process.argv.slice(2) +'\n';
			} else if (moment().hour() > 14 && moment().hour() < 16) {
				txt += 'Good Afternoon ' + process.argv.slice(2) + '\n';
			} else if (moment().hour() > 18) {
				txt += 'Good Evening ' + process.argv.slice(2) + '\n';
			} else {
				txt += 'Hello! ' + process.argv.slice(2) + '\n';
			}

			if (currentHour > 12) {
				currentHour -= 12;
			} else if (currentHour === 0) {
				currentHour = 12;
			}
			txt += 'The Current time is ' + currentHour + ' ';
			if (moment().minute() !== 0) {
				if (moment().minute() < 10) {
					txt += ' o ';
				}
				txt += moment().minute() + ' \n';
			}
			txt += '. Today you have ' + events.length + ' events scheduled. \n';
			for (var i = 0; i < events.length; i++) {
				var event = events[i];
				var start = event.start.dateTime; //|| event.start.date;
				var date = new Date(start);
				var hours = date.getHours();

				if (hours === 0) {
					if (date.getMinutes() !== 0) {
						txt += 'At 12 ' + date.getMinutes() + ' am you have an event, ' + event.summary + '.\n';
					} else {
						txt += 'At midnight you have an event, ' + event.summary + '.\n';
					}
				} else if (hours < 12) {
					if (date.getMinutes() !== 0) {
						txt += 'At ' + hours + ' ' + date.getMinutes() + ' am you have an event, ' + event.summary + '.\n';
					} else {
						txt += 'At ' + hours + ' am you have an event, ' + event.summary + '.\n';
					}
				} else if (hours == 12) {
					if (date.getMinutes() !== 0) {
						txt += 'At ' + hour + ' ' + date.getMinutes() + ' pm you have an event, ' + event.summary + '.\n';
					} else {
						txt += 'At noon you have an event, ' + event.summary + '\n';
					}
				} else {
					var tempHour = hours - 12;
					if (date.getMinutes() !== 0) {
						txt += 'At ' + tempHour + ' ' + date.getMinutes() + ' pm you have an event, ' + event.summary + '.\n';
					} else {
						txt += 'At ' + tempHour + ' pm you have, ' + event.summary + '.\n';
					}
				}
			}

			setReminder(events[0]);
			//console.log(txt);

			fs.writeFile("calendar.txt", txt, function(err) {
				if (err) {
					return console.log(err);
				}

				console.log("The file was saved! ");
			});


		}
	});
}

function setReminder(event) {
	var eventTime = '';
	var reminder = '';
	var tmp = new Date(event.start.dateTime);
	time = tmp.getHours();
	if (time === 0) {
		time = 12;
	} else if (time > 12) {
		time -= 12;
	}
	eventTime += time + ' ';
	if (tmp.getMinutes() !== 0) {
		eventTime += tmp.getMinutes();
	} else {
		eventTime += ' o clock ';
	}

	var timeTil = '';
	var diff = Math.abs(new Date(event.start.dateTime) - new Date());
	console.log(new Date(event.start.dateTime));
	console.log(new Date());
	console.log(diff);
	var diffHours = Math.floor(diff / (1000 * 3600));
	var diffMin = Math.ceil(diff / (1000 * 60)) - diffHours * 60;
	if (diffHours !== 0) {
		timeTil += diffHours + ' hours and ';
	}
	if (diffMin !== 0) {
		timeTil += diffMin + ' minutes ';
	}
	reminder = '. Finally, we would like to remind you that your next event, ' + event.summary;
	reminder += ' is scheduled in ' + timeTil + ' at ' + eventTime + ' ';

	if (event.location) { //if there is a location
		var loc = event.location.toString();
		//console.log('blahblahb' +loc.toStr;loc.split(",", 1)
		location = ' at ' + loc.split(",", 1) + ". ";
		var duration;
		gm.directions('7414 Hollister Avenue, Goleta, CA 93117', event.location, function(err, data) {
			duration = data.routes[0].legs[0].duration.value; //.legs[0].departure_time);

			var durMinutes = Math.ceil(duration / 60);
			var depart = duration + 600;
			var t = new Date(new Date(event.start.dateTime) - depart * 1000);
			//console.log(t.getTime());
			var departTime = t.getHours();
			depart = Math.ceil(depart / 60);
			if (departTime === 0) {
				departTime = 12;
			} else if (departTime > 12) {
				departTime -= 12;
			}
			location += ' Travel time is estimated at ' + durMinutes + ' minutes.';
			location += ' We suggest departing ' + depart + ' minutes early, at ' + departTime;
			if (t.getMinutes() !== 0) {
				location += ' ' + t.getMinutes();
			} else {
				location += ' o clock';
			}
			reminder += location + '. \n';
			console.log(reminder);
			fs.writeFile("reminder.txt", reminder, function(err) {
				if (err) {
					return console.log(err);
				}
				console.log("Reminder file was saved!");
			});
		});
	} else {
		console.log(reminder);
		fs.writeFile("reminder.txt", reminder, function(err) {
			if (err) {
				return console.log(err);
			}
			console.log("Reminder file was saved!");
		});
	}
}