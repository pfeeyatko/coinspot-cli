var hmac = require("crypto").createHmac,
	https = require('https');

function coinspot(key, secret) {
  	var self = this;
  	self.key = key;
  	self.secret = secret;

	var request = function(path, postdata, callback) {
		var nonce = new Date().getTime();

		var postdata = postdata || {};
		postdata.nonce = nonce;

		var stringmessage = JSON.stringify(postdata);
		var signedMessage = new hmac("sha512", self.secret);

		signedMessage.update(stringmessage);

		var sign = signedMessage.digest('hex');

		var options = {
			rejectUnauthorized: false,
			method: 'POST',
			host: 'www.coinspot.com.au',
			port: 443,
			path: path,
			headers: {
				'Content-Type': 'application/json',
				'sign': sign,
				'key': self.key
			}
		};

		var req = https.request(options, function(resp){
			var data = '';
			resp.on('data', function(chunk){
				data += chunk;
			});
			resp.on('end', function(chunk){
				callback(null, data);
			});
		}).on("error", function(e){
			callback(e, data);
		});

		req.write(stringmessage);
		req.end();
	}

	self.sendcoin = function(cointype, amount, address, callback) {
		request('/api/my/coin/send', {cointype:cointype, amount:amount, address:address}, callback);
	}

	self.coindeposit = function(cointype, callback) {
		request('/api/my/coin/deposit', {cointype:cointype}, callback);
	}

	self.quotebuy = function(cointype, amount, type, callback) {
		request('/api/v2/quote/buy/now', {cointype:cointype, amount:amount, amounttype:type}, callback);
	}

	self.quotesell = function(cointype, amount, callback) {
		request('/api/quote/sell', {cointype:cointype, amount:amount}, callback);
	}

	self.balances = function(callback) {
		request('/api/v2/ro/my/balances', {}, callback);
	}

	self.orders = function(cointype, callback) {
		request('/api/orders', {cointype:cointype}, callback);
	}

	self.myorders = function(callback) {
		request('/api/my/orders', {}, callback);
	}

	self.spot = function(callback) {
		request('/api/spot', {}, callback);
	}

	self.marketbuy = function(cointype, amount, rate, callback) {
		var data = {cointype:cointype, amount:amount, rate: rate}
		request('/api/v2/my/buy', data, callback);
	}

	self.buynow = function(cointype, type, amount, callback) {
		var data = {cointype:cointype, amounttype: type, amount:amount}
		request('/api/v2/my/buy/now', data, callback);
	}

	self.sell = function(cointype, amount, rate, callback) {
		var data = {cointype:cointype, amount:amount, rate: rate}
		request('/api/my/sell', data, callback);
	}
}

module.exports = coinspot;