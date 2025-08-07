import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { generateUniqueSlug, validateUrl } from '$lib/url';
import { verifyToken } from '$lib/auth';

const prisma = new PrismaClient();
const isHttps = process.env.HTTPS_MODE === "true";

export async function POST({ request }: { request: Request }) {
	try {
		const { originalUrl, customSlug, title, description, expiresAt, password } = await request.json();

		if (!originalUrl) {
			return json({ error: 'Original URL is required' }, { status: 400 });
		}

		if (!validateUrl(originalUrl)) {
			return json({ error: 'Invalid URL format' }, { status: 400 });
		}

		// Check authentication
		const authHeader = request.headers.get('authorization');
		let userId: string | undefined;
		
		if (authHeader && authHeader.startsWith('Bearer ')) {
			const token = authHeader.substring(7);
			const decoded = verifyToken(token);
			if (decoded) {
				userId = decoded.userId;
			}
		}

		// Generate or validate slug
		let slug: string;
		let isCustom = false;

		if (customSlug) {
			// Check if custom slug is available
			const existing = await prisma.url.findUnique({ where: { slug: customSlug } });
			if (existing) {
				return json({ error: 'Custom slug already exists' }, { status: 409 });
			}
			slug = customSlug;
			isCustom = true;
		} else {
			slug = await generateUniqueSlug();
		}

		// Create URL
		const url = await prisma.url.create({
			data: {
				originalUrl,
				slug,
				title,
				description,
				isCustom,
				expiresAt: expiresAt ? new Date(expiresAt) : null,
				password: password || null,
				userId
			}
		});

		return json({
			message: 'URL created successfully',
			url: {
				id: url.id,
				originalUrl: url.originalUrl,
				slug: url.slug,
				shortUrl: `${isHttps ? 'https' : 'http'}://${new URL(request.url).host}/${url.slug}`,
				title: url.title,
				description: url.description,
				expiresAt: url.expiresAt,
				hasPassword: !!url.password
			}
		});
	} catch (error) {
		console.error('URL creation error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function GET({ request }: { request: Request }) {
	try {
		// Check authentication
		const authHeader = request.headers.get('authorization');
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return json({ error: 'Authentication required' }, { status: 401 });
		}

		const token = authHeader.substring(7);
		const decoded = verifyToken(token);
		if (!decoded) {
			return json({ error: 'Invalid token' }, { status: 401 });
		}

		const urls = await prisma.url.findMany({
			where: { userId: decoded.userId },
			include: {
				clicks: {
					select: { id: true }
				}
			},
			orderBy: { createdAt: 'desc' }
		});

		return json({
			urls: urls.map(url => ({
				...url,
				shortUrl: `${isHttps ? 'https' : 'http'}://${new URL(request.url).host}/${url.slug}`,
				clickCount: url.clicks.length
			}))
		});
	} catch (error) {
		console.error('URL fetch error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
} 