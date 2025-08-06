import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(userId: string): string {
	return jwt.sign({ userId }, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string): { userId: string } | null {
	try {
		return jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
	} catch {
		return null;
	}
}

export async function authenticateUser(email: string, password: string) {
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) return null;
	
	const isValid = await verifyPassword(password, user.password);
	if (!isValid) return null;
	
	return user;
} 