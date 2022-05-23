# Node Spotify API

A simple to use API library for the Spotify REST API.
Only supports searching for tracks|albums|artists however the 2 former ones have not been tested. 

#### What's Different?
* Uses ``undici`` instead of ``request-promise`` (1 dependency instead of x).
* The code base has been completely rewritten and halved.
* Code is much easier to read and doesn't use weird mixtures of Promises and async/await.
* Returns the same results, a drop-in replacement with options (some missing as of the initial release).
* Added in a copy of the [ISC LICENSE](./LICENSE) based on the package.json 

## Installation

```sh-session
npm install rygent/node-spotify-api
yarn add rygent/node-spotify-api
```

## API

Currently there is one method, ``search``. 🔍

### Search

``search`` is the EASIEST way to find an artist, album, or track.
Neither artist or album have been tested with this fork.

```js
<spotify>.search({ type: 'artist|album|track', query: 'My search query', limit: 20 });
```

#### Example

```js
const Spotify = require('node-spotify-api');

const spotify = new Spotify({
    id: 'client id',
    secret: 'client secret'
});

// later on ...
await spotify.search({ type: 'track', query: 'I Me Mine' });
await spotify.search({ type: 'album', query: 'Let It Be' });
await spotify.search({ type: 'artist', query: 'The Beatles' });
```

Note: The `limit` property is optional and the search will default to 20 if one is not supplied.

#### Usage with Promises/Callbacks
* This package only supports Promises or async/await.
* Use [Util.callbackify](https://nodejs.org/api/util.html#util_util_callbackify_original) to use with callbacks (but why?).
