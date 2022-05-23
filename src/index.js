const { fetch } = require('undici');

const TOKEN_URI = 'https://accounts.spotify.com/api/token';
const SEARCH_URI = 'https://api.spotify.com/v1/search';

module.exports = class Spotify {

	constructor(credentials) {
		this.credentials = { id: credentials.id, secret: credentials.secret };
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
		try {
			const res = await fetch(TOKEN_URI, {
				method: 'POST',
				body: await this.encode({
					grant_type: 'client_credentials',
					client_id: this.credentials.id,
					client_secret: this.credentials.secret
				}),
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

	async encode(data) {
		let string = '';
		for (const [key, value] of Object.entries(data)) {
			if (!value) continue;
			string += `&${encodeURIComponent(key)}=${encodeURIComponent(`${value}`)}`;
		}
		return string.slice(1);
	}

	get expired() {
		if (this.token && new Date().getTime() >= this.expires) {
			return true;
		}

		return false;
	}

};
