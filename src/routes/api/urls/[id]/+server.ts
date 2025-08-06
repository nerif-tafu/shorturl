import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { verifyToken, verifyPassword } from '$lib/auth';
import { validateUrl } from '$lib/url';

const prisma = new PrismaClient();

export async function PUT({ params, request }: { params: { id: string }, request: Request }) {
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
		const existingUrl = await prisma.url.findFirst({
			where: {
				id: params.id,
				userId: decoded.userId
			}
		});

		if (!existingUrl) {
			return json({ error: 'URL not found or access denied' }, { status: 404 });
		}

		const { originalUrl, slug, title, description, expiresAt, password, isActive } = await request.json();

		// Validate URL if provided
		if (originalUrl && !validateUrl(originalUrl)) {
			return json({ error: 'Invalid URL format' }, { status: 400 });
		}

		// Check if slug is being changed and if it's available
		if (slug && slug !== existingUrl.slug) {
			const slugExists = await prisma.url.findUnique({ where: { slug } });
			if (slugExists) {
				return json({ error: 'Slug already exists' }, { status: 409 });
			}
		}

		// Update URL
		const updatedUrl = await prisma.url.update({
			where: { id: params.id },
			data: {
				...(originalUrl && { originalUrl }),
				...(slug && slug !== existingUrl.slug && { slug, isCustom: true }),
				...(title !== undefined && { title }),
				...(description !== undefined && { description }),
				...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
				...(password !== undefined && { password: password || null }),
				...(isActive !== undefined && { isActive })
			}
		});

		return json({
			message: 'URL updated successfully',
			url: {
				id: updatedUrl.id,
				originalUrl: updatedUrl.originalUrl,
				slug: updatedUrl.slug,
				shortUrl: `${new URL(request.url).origin.replace('/api/urls/' + params.id, '')}/${updatedUrl.slug}`,
				title: updatedUrl.title,
				description: updatedUrl.description,
				expiresAt: updatedUrl.expiresAt,
				hasPassword: !!updatedUrl.password,
				isActive: updatedUrl.isActive,
				isCustom: updatedUrl.isCustom
			}
		});
	} catch (error) {
		console.error('URL update error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
}

export async function DELETE({ params, request }: { params: { id: string }, request: Request }) {
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
		const existingUrl = await prisma.url.findFirst({
			where: {
				id: params.id,
				userId: decoded.userId
			}
		});

		if (!existingUrl) {
			return json({ error: 'URL not found or access denied' }, { status: 404 });
		}

		// Delete URL (this will cascade delete clicks)
		await prisma.url.delete({
			where: { id: params.id }
		});

		return json({ message: 'URL deleted successfully' });
	} catch (error) {
		console.error('URL deletion error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
} 