// For any LCU activity
const LCUConnector = require('lcu-connector');
const connector = new LCUConnector();
let authToken = 'UNAUTHORIZED';

// for event handling
const WebSocket = require('ws');
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

// For the requests seen in Rift Explorer
const got = require('got');

// An event for when the League client has been found
connector.on('connect', async(data) => {
	authToken = `Basic ${(Buffer.from(`${data.username}:${data.password}`)).toString('base64')}`
	let ws = new WebSocket(`wss://${data.username}:${data.password}@127.0.0.1:${data.port}/`, "wamp", { Authorization: authToken });

	ws.on('error', (err) => {
		console.log("An error occurred on the websocket connection:\n", err.stack);
	});

	ws.on('message', (msg) => {
		console.log("WebSocket event: ", JSON.parse(msg));
	});

	ws.on('open', () => {
		console.log("Connected to the wamp service.");
		ws.send('[5, "OnJsonApiEvent"]');
	});

	// Get the current summoner
	console.log("Current summoner:", await getCurrentSummoner(data));
});

connector.on('disconnect', () => {
	console.error('League Client has been closed');
});

connector.start();

async function getCurrentSummoner(data) {
	try {
		const response = await got(`https://127.0.0.1:${data.port}/lol-summoner/v1/current-summoner`, {
			rejectUnauthorized: false,
			method: "GET",
			headers: {
				Authorization: authToken,
				Accept: "application/json"
			}
		});

		return JSON.parse(response.body);
	}
	catch (e) {
		if (e && e.statusCode === 404) // Not logged in?
			return null;
		throw e;
	}
}