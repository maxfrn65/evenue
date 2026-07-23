import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('./db', () => ({
	prisma: {
		user: {
			findUnique: vi.fn(),
			create: vi.fn()
		}
	}
}));

import { prisma } from './db';
import { hashPassword, verifyPassword, registerUser, loginUser } from './auth';

describe('Auth Service — Hashing, Registration & Login', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Password Hashing', () => {
		it('should hash password with scrypt and generate unique salt', () => {
			const password = 'SecretPassword123!';
			const hash1 = hashPassword(password);
			const hash2 = hashPassword(password);

			expect(hash1).not.toBe(password);
			expect(hash1).not.toBe(hash2);
			expect(hash1).toContain(':');
		});

		it('should successfully verify valid password', () => {
			const password = 'StrongEventPassword2026';
			const hash = hashPassword(password);

			expect(verifyPassword(password, hash)).toBe(true);
		});

		it('should reject invalid password', () => {
			const password = 'StrongEventPassword2026';
			const hash = hashPassword(password);

			expect(verifyPassword('WrongPassword', hash)).toBe(false);
		});

		it('should handle malformed hash gracefully', () => {
			expect(verifyPassword('password', 'malformedhash')).toBe(false);
		});
	});

	describe('registerUser & loginUser', () => {
		it('should register a new user successfully', async () => {
			vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
			vi.mocked(prisma.user.create).mockResolvedValue({
				id: 'u-1',
				email: 'test@evenue.fr',
				firstName: 'Jean',
				lastName: 'Dupont',
				role: 'HOST',
				kycStatus: 'NOT_STARTED',
				stripeAccountId: null,
				createdAt: new Date()
			} as any);

			const user = await registerUser({
				email: 'TEST@evenue.fr ',
				password: 'password123',
				firstName: 'Jean',
				lastName: 'Dupont',
				role: 'HOST'
			});

			expect(user.id).toBe('u-1');
			expect(user.email).toBe('test@evenue.fr');
		});

		it('should throw error if registering with existing email', async () => {
			vi.mocked(prisma.user.findUnique).mockResolvedValue({ id: 'existing-1' } as any);

			await expect(
				registerUser({
					email: 'existing@evenue.fr',
					password: 'password123',
					firstName: 'Jean',
					lastName: 'Dupont'
				})
			).rejects.toThrow('Un compte avec cette adresse email existe déjà.');
		});

		it('should login user successfully with valid credentials', async () => {
			const password = 'mySecretPassword!';
			const hash = hashPassword(password);

			vi.mocked(prisma.user.findUnique).mockResolvedValue({
				id: 'u-1',
				email: 'test@evenue.fr',
				passwordHash: hash,
				firstName: 'Jean',
				lastName: 'Dupont',
				role: 'HOST',
				kycStatus: 'VERIFIED',
				stripeAccountId: 'acct_123'
			} as any);

			const user = await loginUser('test@evenue.fr', password);

			expect(user.id).toBe('u-1');
			expect(user.role).toBe('HOST');
		});

		it('should throw error on login with invalid credentials', async () => {
			vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

			await expect(loginUser('wrong@evenue.fr', 'password')).rejects.toThrow('Identifiants incorrects.');
		});
	});
});
