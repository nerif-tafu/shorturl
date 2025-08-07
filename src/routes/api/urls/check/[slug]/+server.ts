import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET({ params }: { params: { slug: string } }) {
	try {
		const { slug } = params;
		console.log('Checking URL status for slug:', slug);

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
			return json({ 
				error: 'Password required',
				requiresPassword: true,
				urlId: url.id
			}, { status: 401 });
		}

		// For non-password-protected URLs, return the redirect URL
		console.log('URL is valid, returning redirect URL');
		return json({
			redirectUrl: url.originalUrl,
			urlId: url.id
		});
	} catch (error) {
		console.error('Error in URL check:', error);
		return json({ error: 'Internal server error', details: String(error) }, { status: 500 });
	}
}
