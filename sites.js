'use strict'

const heritage = require('world-heritage')
const image = require('world-heritage-image')
const commons = require('commons-photo-url')

const getSites = () =>
	heritage()
	.then((list) =>
		Promise.all(list.map((x) => image(x.id).then((y) => [x.id, y])))
		.then((images) => images.filter(([id, img]) => img).map(([id, img]) => {
			const item = list.filter((i) => i.id === id)[0]
			item.wikiImage = commons(img)
			return item
		}))
	)

getSites().then((res) => {process.stdout.write(JSON.stringify(res))}).catch(console.error)
