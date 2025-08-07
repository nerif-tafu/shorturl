import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

export function generateRandomSlug(length: number = 5): string {
	let result = '';
	for (let i = 0; i < length; i++) {
		result += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
	}
	return result;
}

export async function isSlugAvailable(slug: string): Promise<boolean> {
	const existing = await prisma.url.findUnique({ where: { slug } });
	return !existing;
}

export async function generateUniqueSlug(length: number = 5): Promise<string> {
	let slug: string;
	do {
		slug = generateRandomSlug(length);
	} while (!(await isSlugAvailable(slug)));
	return slug;
}

export function validateUrl(url: string): boolean {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
}

export function normalizeUrl(url: string): string {
	// If the URL doesn't start with a protocol, assume HTTPS
	if (!url.match(/^https?:\/\//)) {
		url = 'https://' + url;
	}
	
	// Ensure the URL is valid and force HTTPS for security
	try {
		const urlObj = new URL(url);
		// Force HTTPS for security - this ensures all URLs are HTTPS
		urlObj.protocol = 'https:';
		return urlObj.toString();
	} catch {
		throw new Error('Invalid URL format');
	}
}

export function getBaseUrl(request: Request): string {
	const url = new URL(request.url);
	return `${url.protocol}//${url.host}`;
}

export async function updateExistingUrlsToHttps(): Promise<void> {
	try {
		const urls = await prisma.url.findMany();
		let updatedCount = 0;

		for (const url of urls) {
			try {
				const normalizedUrl = normalizeUrl(url.originalUrl);
				if (normalizedUrl !== url.originalUrl) {
					await prisma.url.update({
						where: { id: url.id },
						data: { originalUrl: normalizedUrl }
					});
					updatedCount++;
				}
			} catch (error) {
				console.error(`Failed to normalize URL ${url.id}:`, error);
			}
		}

		console.log(`Updated ${updatedCount} URLs to use HTTPS`);
	} catch (error) {
		console.error('Error updating URLs to HTTPS:', error);
	}
} 