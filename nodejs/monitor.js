/* This script monitors Salesforces' webservice availability */
const jsforce = require('jsforce');
const moment = require('moment');
const { config } = require('./config');

class OrgMonitor {
	constructor(url, username, password) {
		this.url = url;
		this.username = username;
		this.password = password;
		this.cycle = 0;
		setInterval(this.check.bind(this), 2000);
	}
	check() {
		const localCycle = this.cycle;
		this.cycle++;
		const conn = new jsforce.Connection({
			loginUrl: this.url
		});
		var start = +new Date();
		var end;
		this.log(localCycle, 'Cycle started');
		try {
			conn.login(this.username, this.password, (err) => {
				if (err) {
					end = +new Date();
					this.log(localCycle, 'Error logging in: ' + err.message + ' trace: ' + JSON.stringify(err.stack) + ' took ' + (end - start) + 'ms');
					return console.error(err);
				}
				conn.apex.get("/services/apexrest/LongTxn", (err) => {
					end = +new Date();
					if (err) {
						this.log(localCycle, 'Error performing apex: ' + err.message + ' trace: ' + JSON.stringify(err.stack) + ' took ' + (end - start) + 'ms');
						return console.error(err);
					}
					this.log(localCycle, 'ALL OK - took ' + (end - start) + ' ms');
					return;
				});
			});
		} catch (e) {
			end = +new Date();
			this.log(localCycle, 'Exception',  + err.message + ' trace: ' + JSON.stringify(err.stack) + ' took ' + (end - start) + 'ms');
		}
	}
	log(currentCycle, data) {
		console.log(`[${moment().format()}] [${currentCycle}]`, JSON.stringify(data));
	}
}

const monitor = new OrgMonitor(config.url, config.username, config.password)
