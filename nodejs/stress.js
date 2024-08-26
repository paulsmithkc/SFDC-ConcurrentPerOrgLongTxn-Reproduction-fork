/* This script attempts to create a large number of concurrent requests */
const fs = require('fs');
const jsforce = require('jsforce');
const config = JSON.parse(fs.readFileSync('config.json').toString());
const https = require('https');

const writeDelay = 20_000;
const endDelay = 40_000;

class Instance {
	constructor(accessToken, url) {
		this.accessToken = accessToken;
		this.url = url;

		setTimeout(this.start.bind(this), 0);
		setTimeout(this.write.bind(this, '{"key": "value"}'), writeDelay);
		setTimeout(this.end.bind(this), endDelay);
	}
	start() {
		const options = {
			port: 443,
			hostname: this.url.replace('https://', ''),
			path: '/services/apexrest/LongTxn',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'OAuth ' + this.accessToken,
				'Transfer-Encoding': 'chunked'
			}
		};

		this.req = https.request(options);
		this.req.setTimeout(150_000, (err) => {
			console.error('Timed out');
		});
		this.req.on('response', (response) => {
			response.on('data', function (chunk) {
				console.log('response: ' + chunk);
			});
		})
		this.req.on('error', (error) => {
			console.log('error', error)
		})
		this.req.flushHeaders();
	}
	write(data) {
		console.log('writing data', data);
		this.req.write(data, 'UTF-8', (err) => {
			if (err) {
				return console.error(err);
			}
		})
	}
	end() {
		console.log('ending request');
		this.req.end((err) => {
			if (err) {
				return console.error(err);
			}
		})
	}
}

const instances = [];

const conn = new jsforce.Connection({
	loginUrl : config.url
});
conn.login(config.username, config.password, function(err) {
	if (err) {
		return console.error(err);
	}
	for (let i = 0; i < config.numberOfInstances; i++) {
		instances.push(new Instance(conn.accessToken, conn.instanceUrl));
	}
});
