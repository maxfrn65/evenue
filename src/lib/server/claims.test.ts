import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('./db', () => ({
	prisma: {
		booking: {
			findFirst: vi.fn(),
			update: vi.fn()
		},
		insurancePolicy: {
			update: vi.fn()
		}
	}
}));

import { prisma } from './db';
import { submitClaim, generateWakamCertificateHTML } from './claims';

describe('Claims Service & Wakam Certificate Generator', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('submitClaim', () => {
		it('should submit a claim successfully and update policy status to CLAIMED', async () => {
			const mockBooking = {
				id: 'booking-1',
				guestId: 'guest-1',
				insurancePolicy: {
					id: 'policy-1',
					policyNumber: 'WAK-2026-89412',
					status: 'ACTIVE'
				},
				listing: {
					hostId: 'host-1'
				}
			};

			vi.mocked(prisma.booking.findFirst).mockResolvedValue(mockBooking as any);
			vi.mocked(prisma.insurancePolicy.update).mockResolvedValue({
				id: 'policy-1',
				policyNumber: 'WAK-2026-89412',
				status: 'CLAIMED'
			} as any);
			vi.mocked(prisma.booking.update).mockResolvedValue({} as any);

			const result = await submitClaim({
				bookingId: 'booking-1',
				userId: 'guest-1',
				damageType: 'SOUND_SYSTEM',
				description: 'Le système de sonorisation a subi un court-circuit lors de la soirée.',
				estimatedCost: 1500
			});

			expect(result.bookingId).toBe('booking-1');
			expect(result.policyNumber).toBe('WAK-2026-89412');
			expect(result.status).toBe('SUBMITTED');
			expect(prisma.insurancePolicy.update).toHaveBeenCalledWith({
				where: { id: 'policy-1' },
				data: { status: 'CLAIMED' }
			});
			expect(prisma.booking.update).toHaveBeenCalledWith({
				where: { id: 'booking-1' },
				data: { status: 'DISPUTED' }
			});
		});

		it('should throw an error if description is too short', async () => {
			await expect(
				submitClaim({
					bookingId: 'booking-1',
					userId: 'guest-1',
					damageType: 'FURNITURE',
					description: 'Court',
					estimatedCost: 500
				})
			).rejects.toThrow('La description du sinistre doit comporter au moins 10 caractères.');
		});

		it('should throw an error if booking does not exist or has no policy', async () => {
			vi.mocked(prisma.booking.findFirst).mockResolvedValue(null);

			await expect(
				submitClaim({
					bookingId: 'booking-99',
					userId: 'guest-1',
					damageType: 'STRUCTURE',
					description: 'Description valide de plus de dix caractères',
					estimatedCost: 2000
				})
			).rejects.toThrow('Réservation introuvable');
		});
	});

	describe('generateWakamCertificateHTML', () => {
		it('should generate valid certificate HTML containing policy number and guarantee bounds', async () => {
			const mockBooking = {
				id: 'booking-1',
				startDate: new Date('2026-08-15'),
				endDate: new Date('2026-08-16'),
				guest: { firstName: 'Alexandre', lastName: 'Rivière', email: 'alex@evenue.fr' },
				listing: {
					title: 'Villa test',
					address: '10 rue test',
					city: 'Paris',
					host: { firstName: 'Jean', lastName: 'Dupont', kycStatus: 'VERIFIED' }
				},
				insurancePolicy: {
					policyNumber: 'WAK-2026-999',
					status: 'ACTIVE'
				}
			};

			vi.mocked(prisma.booking.findFirst).mockResolvedValue(mockBooking as any);

			const html = await generateWakamCertificateHTML('booking-1', 'guest-1');

			expect(html).toContain('WAK-2026-999');
			expect(html).toContain('10 000,00 €');
			expect(html).toContain('Alexandre Rivière');
			expect(html).toContain('Jean Dupont');
		});
	});
});
