const { URLSearchParams } = require('node:url');
const { fetch } = require('undici');

const TOKEN_URI = 'https://accounts.spotify.com/api/token';
const SEARCH_URI = 'https://api.spotify.com/v1/search';

module.exports = class Spotify {

	constructor(options) {
		if (!options || !options.id || !options.secret) {
			throw new Error('You must supply an object containing your Spotify client "id" and "secret".');
		}

		this.credentials = { id: options.id, secret: options.secret };
	}

	async search(options) {
		try {
			const uri = `${SEARCH_URI}?type=${options.type}&q=${encodeURIComponent(options.query)}&limit=${options.limit || 20}`;

			const res = await fetch(uri, {
				method: 'GET',
				headers: { ...await this.getTokenHeader() }
			});

			if (res.status === 200) {
				return res.json();
			}

			throw new Error(`Received status ${res.status} (${res.statusText})`);
		} catch (error) {
			throw error;
		}
	}

	async setToken() {
		const params = new URLSearchParams();
		params.append('grant_type', 'client_credentials');
		params.append('client_id', this.credentials.id);
		params.append('client_secret', this.credentials.secret);

		try {
			const res = await fetch(TOKEN_URI, {
				method: 'POST',
				body: params,
				headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
			});

			if (res.status === 200) {
				this.token = await res.json();
				this.expires = (new Date().getTime() + this.token.expires_in) * 1000;
				return true;
			}

			throw new Error(`Received status ${res.status} (${res.statusText})`);
		} catch (error) {
			throw error;
		}
	}

	async getTokenHeader() {
		if (!this.token || !this.token.access_token || this.expired) {
			await this.setToken();
		}

		return { Authorization: `Bearer ${this.token.access_token}` };
	}

	get expired() {
		if (this.token && new Date().getTime() >= this.expires) {
			return true;
		}

		return false;
	}

};
