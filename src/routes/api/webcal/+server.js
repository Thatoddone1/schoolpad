import { json } from '@sveltejs/kit';
import fetch from 'node-fetch';
import ICAL from 'ical.js';

const CORRECT_USERNAME = 'joshua';
const CORRECT_PASSWORD = 'joshua';

export async function GET({ url, request }) {
	// Basic Auth check
	const authHeader = request.headers.get('Authorization');
	if (!authHeader) {
		return new Response('Authentication required', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Restricted Area"'
			}
		});
	}

	const encodedCredentials = authHeader.split(' ')[1];
	const decodedCredentials = atob(encodedCredentials);
	const [username, password] = decodedCredentials.split(':');

	if (username !== CORRECT_USERNAME || password !== CORRECT_PASSWORD) {
		return json({ error: 'Invalid credentials' }, { status: 401 });
	}

	// Webcal processing
	const feedUrl = url.searchParams.get('url');

	if (!feedUrl) {
		return json({ error: 'No webcal URL provided' }, { status: 400 });
	}

	try {
		const response = await fetch(feedUrl.replace('webcal://', 'https://'));
		const data = await response.text();

		const jcalData = ICAL.parse(data);
		const comp = new ICAL.Component(jcalData);
		const vevents = comp.getAllSubcomponents('vevent');

		const now = new Date();
		const oneWeekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

		const events = vevents
			.map((vevent) => {
				const event = new ICAL.Event(vevent);
				return {
					summary: event.summary,
					description: event.description,
					start: event.startDate.toJSDate(),
					end: event.endDate.toJSDate()
				};
			})
			.filter((event) => event.start >= now && event.start <= oneWeekFromNow && event.end >= now)
			.sort((a, b) => a.start - b.start);

		return json(events);
	} catch (error) {
		console.error('Error fetching webcal feed:', error);
		return json({ error: 'Failed to fetch webcal feed' }, { status: 500 });
	}
}
