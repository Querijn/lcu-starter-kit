const LCUConnector = require('lcu-connector');
const WebSocket = require('ws');
const connector = new LCUConnector();
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

connector.on('connect', (data) => {
	let authToken = (Buffer.from(`${data.username}:${data.password}`)).toString('base64');
	let ws = new WebSocket(`wss://${data.username}:${data.password}@127.0.0.1:${data.port}/`, "wamp", {
		Authorization: `Basic ${authToken}`
	});

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
});

connector.on('disconnect', () => {
	console.error('League Client has been closed');
});

connector.start();