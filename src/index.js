const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const TOKEN_URI = "https://accounts.spotify.com/api/token";
const SEARCH_URI = "https://api.spotify.com/v1/search";

class Spotify {
    constructor({ id, secret }) {
        this.creds = { id: id, secret: secret };
    }
  
    async search(search) {
        try {
            const uri = `${SEARCH_URI}?type=${search.type}&q=${encodeURIComponent(search.query)}&limit=20`;

            const res = await fetch(uri, {
                method: 'GET',
                headers: await this.getTokenHeader()
            });

            if(res.status === 200) {
                return res.json();
            } 
            
            throw new Error(`Received status ${res.status} (${res.statusText})`);
        } catch(err) {
            throw err;
        }
    }
  
    async setToken() {
        const params = new URLSearchParams(); // based on node-fetch docs
        params.append('grant_type', 'client_credentials');

        try {
            const res = await fetch(TOKEN_URI, {
                method: 'POST',
                body: params,
                headers: {
                    Authorization: `Basic ${Buffer.from(`${this.creds.id}:${this.creds.secret}`, 'utf8').toString('base64')}`
                }
            });

            if(res.status === 200) {
                this.token = await res.json();
                this.expires = new Date().getTime() + res.expires_in * 1000; // in milliseconds
                return true;
            }            

            throw new Error(`Received status ${res.status} (${res.statusText})`);
        } catch(err) {
            throw err;
        }
    }
  
    async getTokenHeader() {
        if(!this.token || !this.token.access_token || this.expired) {
            await this.setToken();
        }

        return { Authorization: `Bearer ${this.token.access_token}` };
    }

    get expired() {
        if(this.token && new Date().getTime() >= this.expires) {
            return true;
        } 

        return false;
    }
}
  
module.exports = { Spotify };