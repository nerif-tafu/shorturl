import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '$lib/auth';

const prisma = new PrismaClient();

export async function POST({ request }: { request: Request }) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		if (password.length < 6) {
			return json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
		}

		const existingUser = await prisma.user.findUnique({ where: { email } });
		if (existingUser) {
			return json({ error: 'User already exists' }, { status: 409 });
		}

		const hashedPassword = await hashPassword(password);
		const user = await prisma.user.create({
			data: {
				email,
				password: hashedPassword
			}
		});

		return json({ 
			message: 'User created successfully',
			user: { id: user.id, email: user.email }
		});
	} catch (error) {
		console.error('Registration error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
} 