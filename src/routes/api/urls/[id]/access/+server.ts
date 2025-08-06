import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { verifyPassword } from '$lib/auth';

const prisma = new PrismaClient();

export async function POST({ params, request }: { params: { id: string }, request: Request }) {
	try {
		const { password } = await request.json();

		if (!password) {
			return json({ error: 'Password is required' }, { status: 400 });
		}

		// Find the URL
		const url = await prisma.url.findUnique({ where: { id: params.id } });
		if (!url) {
			return json({ error: 'URL not found' }, { status: 404 });
		}

		// Check if URL is active
		if (!url.isActive) {
			return json({ error: 'URL is inactive' }, { status: 410 });
		}

		// Check if URL has expired
		if (url.expiresAt && new Date() > url.expiresAt) {
			return json({ error: 'URL has expired' }, { status: 410 });
		}

		// Check if URL requires password
		if (!url.password) {
			return json({ error: 'URL does not require password' }, { status: 400 });
		}

		// Verify password (stored as plain text for simplicity)
		const isValid = password === url.password;
		if (!isValid) {
			return json({ error: 'Invalid password' }, { status: 401 });
		}

		// Track the click
		const ip = request.headers.get('x-forwarded-for') || 
				  request.headers.get('x-real-ip') || 
				  'unknown';
		const userAgent = request.headers.get('user-agent') || 'unknown';
		const referer = request.headers.get('referer') || 'unknown';

		await prisma.click.create({
			data: {
				urlId: url.id,
				ip,
				userAgent,
				referer
			}
		});

		return json({
			message: 'Password verified successfully',
			redirectUrl: url.originalUrl
		});
	} catch (error) {
		console.error('Password verification error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
} 