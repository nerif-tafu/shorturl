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

export function getBaseUrl(request: Request): string {
	const url = new URL(request.url);
	return `${url.protocol}//${url.host}`;
} 