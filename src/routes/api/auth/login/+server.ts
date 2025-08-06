import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import { authenticateUser, generateToken } from '$lib/auth';

const prisma = new PrismaClient();

export async function POST({ request }: { request: Request }) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		const user = await authenticateUser(email, password);
		if (!user) {
			return json({ error: 'Invalid credentials' }, { status: 401 });
		}

		const token = generateToken(user.id);

		return json({ 
			message: 'Login successful',
			token,
			user: { id: user.id, email: user.email }
		});
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
} 