import { scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { prisma } from './db';
import type { UserRole, KycStatus } from '../../../generated/prisma/client';

/**
 * Hash password using Node.js scrypt with salt.
 */
export function hashPassword(password: string): string {
	const salt = randomBytes(16).toString('hex');
	const hashedPassword = scryptSync(password, salt, 64).toString('hex');
	return `${salt}:${hashedPassword}`;
}

/**
 * Verify plaintext password against stored hash.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
	const [salt, key] = storedHash.split(':');
	if (!salt || !key) return false;
	const hashedBuffer = scryptSync(password, salt, 64);
	const keyBuffer = Buffer.from(key, 'hex');
	return timingSafeEqual(hashedBuffer, keyBuffer);
}

export interface RegisterInput {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	role?: UserRole;
}

/**
 * Register a new User in PostgreSQL via Prisma.
 */
export async function registerUser(input: RegisterInput) {
	const existingUser = await prisma.user.findUnique({
		where: { email: input.email.toLowerCase().trim() }
	});

	if (existingUser) {
		throw new Error('Un compte avec cette adresse email existe déjà.');
	}

	const passwordHash = hashPassword(input.password);

	const user = await prisma.user.create({
		data: {
			email: input.email.toLowerCase().trim(),
			passwordHash,
			firstName: input.firstName.trim(),
			lastName: input.lastName.trim(),
			role: input.role ?? 'GUEST',
			kycStatus: 'NOT_STARTED'
		},
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			role: true,
			kycStatus: true,
			stripeAccountId: true,
			createdAt: true
		}
	});

	return user;
}

/**
 * Authenticate user credentials.
 */
export async function loginUser(email: string, password: string) {
	const user = await prisma.user.findUnique({
		where: { email: email.toLowerCase().trim() }
	});

	if (!user) {
		throw new Error('Identifiants incorrects.');
	}

	const isValid = verifyPassword(password, user.passwordHash);

	if (!isValid) {
		throw new Error('Identifiants incorrects.');
	}

	return {
		id: user.id,
		email: user.email,
		firstName: user.firstName,
		lastName: user.lastName,
		role: user.role,
		kycStatus: user.kycStatus,
		stripeAccountId: user.stripeAccountId
	};
}
