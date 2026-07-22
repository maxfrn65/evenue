import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword } from './auth';

describe('Auth Service — Password Hashing & Verification', () => {
	it('should hash password with scrypt and generate unique salt', () => {
		const password = 'SecretPassword123!';
		const hash1 = hashPassword(password);
		const hash2 = hashPassword(password);

		expect(hash1).not.toBe(password);
		expect(hash1).not.toBe(hash2); // Different salts
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
