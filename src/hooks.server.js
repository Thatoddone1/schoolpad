import { error } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Check for the presence of the Authorization header
	const authHeader = event.request.headers.get('Authorization');

	if (!authHeader) {
		// If no Authorization header is present, return a 401 response
		// with a WWW-Authenticate header to prompt for credentials
		return new Response('Authentication required', {
			status: 401,
			headers: {
				'WWW-Authenticate': 'Basic realm="Restricted Area"'
			}
		});
	}

	// Decode and verify the credentials
	const encodedCredentials = authHeader.split(' ')[1];
	const decodedCredentials = atob(encodedCredentials);
	const [username, password] = decodedCredentials.split(':');

	// Replace these with your desired username and password
	const CORRECT_USERNAME = 'joshua';
	const CORRECT_PASSWORD = 'joshua';

	if (username !== CORRECT_USERNAME || password !== CORRECT_PASSWORD) {
		throw error(401, 'Invalid credentials');
	}

	// If authentication is successful, proceed with the request
	return await resolve(event);
}
