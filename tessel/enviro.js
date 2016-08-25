var http = require('http');
var tessel = require('tessel');
var climatelib = require('climate-si7020');

var climate = climatelib.use(tessel.port['A']);

var options = {
	hostname: '84.39.37.61',
  path: '/api/points',
  method: 'POST'
};

var now;
var temperature;
var humidity;
var t;
var req = null;

enviro();

function enviro(){
	climate.on('ready', function () {
		console.log('Connected to si7020');  
		setInterval(function() {
			climate.readTemperature('c', function (err, temp) {
				climate.readHumidity(function (err, humid) {
					
					req = http.request(options, function(res) {
						console.log('STATUS: ' + res.statusCode);
						console.log('HEADERS: ' + JSON.stringify(res.headers));
						res.setEncoding('utf8');
						res.on('data', function (chunk) {
							console.log('BODY: ' + chunk);
						});
					});

					req.on('error', function(e) {
						console.log('problem with request: ' + e.message);
						setTimeout(enviro, 5000);
					});

					// write data to request body
					temperature = temp.toFixed(1);
					humidity = humid.toFixed(1);
					now = new Date();
					console.log('Time:', now, 'Degrees:', temperature + '°C', 'Humidity:', humidity + '%RH');
					t = {
						temp: temperature,
						humidity: humidity,
						time: now.toJSON()
					};
					req.write(JSON.stringify(t));
					req.end();
				});
			});
		}, 7000);
	});
};
