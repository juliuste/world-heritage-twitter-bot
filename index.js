'use strict'

const config = require('config')
const twitterClient = require('twit')
const base64 = require('node-remote-base64')
const shuffle = require('lodash.shuffle')

let sites = require('./sites.json').filter((x) => !!x.site && x.site.length <= 70 && !!x.url)

const twitter = new twitterClient({
	consumer_key: config.twitter.key,
	consumer_secret: config.twitter.key_secret,
	access_token: config.twitter.token,
	access_token_secret: config.twitter.token_secret,
	timeout_ms: 60*1000
})

let sendTweet

if(config.debug){
	sendTweet = (message, url, alt) => console.log(message, url, alt)
	config.interval /= (24*60*60/2)
}
else{
	sendTweet = (message, url, alt) => Promise.resolve().then(() => {
		base64(url).then((encoded) => {
			twitter.post('media/upload', {media_data: encoded.split(',')[1]}, (err, data, response) => {
				if(err) console.error(err)
				const mediaID = data.media_id_string
				const metaParams = {
					media_id: mediaID,
					alt_text: {text: alt}
				}
				twitter.post('media/metadata/create', metaParams, (err, data, response) => {
					if (!err) {
						const params = {
							status: message,
							media_ids: [mediaID]
						}
						twitter.post('statuses/update', params, (e) => e ? console.error(e): console.log('success: ', message))
					}
					else console.error(err)
				})
			})
		})
	}).catch(console.error)
}


const post = () => {
	const site = shuffle(sites)[0]

	const text = `${site.site} ${site.url} (Photo: ${site.wikiImage})`
	const url = site.wikiImage
	const alt = site.site

	sendTweet(text, url, alt)
}

setInterval(() => post(), config.requestInterval * 24*60*60*1000)
