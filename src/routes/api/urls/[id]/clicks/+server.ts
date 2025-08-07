import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { verifyToken } from '$lib/auth';

const prisma = new PrismaClient();

export async function GET({ params, request }: { params: { id: string }, request: Request }) {
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

		// Verify URL ownership
		const url = await prisma.url.findFirst({
			where: {
				id: params.id,
				userId: decoded.userId
			}
		});

		if (!url) {
			return json({ error: 'URL not found or access denied' }, { status: 404 });
		}

		// Get clicks with pagination
		const urlSearchParams = new URL(request.url).searchParams;
		const page = parseInt(urlSearchParams.get('page') || '1');
		const limit = parseInt(urlSearchParams.get('limit') || '50');
		const skip = (page - 1) * limit;

		const [clicks, total] = await Promise.all([
			prisma.click.findMany({
				where: { urlId: params.id },
				orderBy: { timestamp: 'desc' },
				skip,
				take: limit
			}),
			prisma.click.count({
				where: { urlId: params.id }
			})
		]);

		return json({
			clicks,
			pagination: {
				page,
				limit,
				total,
				pages: Math.ceil(total / limit)
			}
		});
	} catch (error) {
		console.error('Click analytics error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function POST({ params, request }: { params: { id: string }, request: Request }) {
	try {
		// Find the URL
		const url = await prisma.url.findUnique({ where: { id: params.id } });
		if (!url) {
			return json({ error: 'URL not found' }, { status: 404 });
		}

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

		return json({ message: 'Click tracked successfully' });
	} catch (error) {
		console.error('Click tracking error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
} 