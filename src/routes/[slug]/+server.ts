import { redirect, json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET({ params, request }: { params: { slug: string }, request: Request }) {
	try {
		const { slug } = params;
		console.log('Looking for slug:', slug);

		// Find the URL
		const url = await prisma.url.findUnique({ where: { slug } });
		console.log('Found URL:', url);
		
		if (!url) {
			console.log('URL not found');
			return json({ error: 'URL not found' }, { status: 404 });
		}

		// Check if URL is active
		if (!url.isActive) {
			console.log('URL is inactive');
			return json({ error: 'URL is inactive' }, { status: 410 });
		}

		// Check if URL has expired
		if (url.expiresAt && new Date() > url.expiresAt) {
			console.log('URL has expired');
			return json({ error: 'URL has expired' }, { status: 410 });
		}

		// Check if URL requires password
		if (url.password) {
			console.log('URL requires password');
			// For password-protected URLs, we'll return a 401 to trigger the password page
			return json({ 
				error: 'Password required',
				requiresPassword: true,
				urlId: url.id
			}, { status: 401 });
		}

		console.log('URL is valid, creating click record...');

		// Track the click
		const ip = request.headers.get('x-forwarded-for') || 
				  request.headers.get('x-real-ip') || 
				  'unknown';
		const userAgent = request.headers.get('user-agent') || 'unknown';
		const referer = request.headers.get('referer') || 'unknown';

		console.log('Creating click with data:', { urlId: url.id, ip, userAgent, referer });

		await prisma.click.create({
			data: {
				urlId: url.id,
				ip,
				userAgent,
				referer
			}
		});

		console.log('Click recorded, redirecting to:', url.originalUrl);

		// Use SvelteKit's redirect function for cleaner redirects
		// This works better with proxies and handles CORS properly
		throw redirect(302, url.originalUrl);
	} catch (error) {
		// Check if this is a redirect (which is expected behavior)
		if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
			console.log('Redirecting to:', error.location);
			throw error;
		}
		
		console.error('Error in GET handler:', error);
		if (error instanceof Response) {
			throw error;
		}
		return json({ error: 'Internal server error', details: String(error) }, { status: 500 });
	}
} 