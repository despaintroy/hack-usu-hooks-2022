import * as cors from 'cors'
import { Webhook } from 'discord-webhook-node'
import express = require('express')
import { Request, Response } from 'express'
import * as functions from 'firebase-functions'

const app = express()

interface RequestPayload {
	api_url: string
	config: {
		action: string
		endpoint_url: string
		user_id: string
		webhook_id: string
	}
}

function getUserId(url: string): string {
	if (url.charAt(url.length - 1) === '/') {
		url = url.substring(0, url.length - 1)
	}

	return url.split('/').pop() ?? ''
}

app.use(cors({ origin: true }))

app.post('/api/eventbrite', (req: Request, res: Response) => {
	const payload: RequestPayload = req.body

	if (payload.config.action === 'barcode.checked_in') {
		const hook = new Webhook(functions.config().discord.webhook_checkin)
		functions.logger.log('EVENTBRITE INVOKED', payload)
		const userID = getUserId(payload.api_url)

		hook.setUsername('New VIP Check-in')
		hook
			.success(
				`**${userID} (Sponsor)**`,
				'From: Utah State University',
				'Host: <@761334958752006145>'
			)
			.catch(err => functions.logger.log(err))
	}

	if (payload.config.action === 'test') {
		const hook = new Webhook(functions.config().discord.webhook_checkin)
		hook.setUsername('Test Notification Webhook')
		hook.send('Test notification.').catch(err => functions.logger.log(err))
	}

	res.status(200).send()
})

exports.app = functions.https.onRequest(app)
