import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
vi.mock('./db', () => ({
	prisma: {
		booking: {
			findUnique: vi.fn(),
			findFirst: vi.fn(),
			update: vi.fn()
		},
		insurancePolicy: {
			update: vi.fn()
		},
		claim: {
			create: vi.fn(),
			findUnique: vi.fn(),
			findFirst: vi.fn(),
			update: vi.fn()
		}
	}
}));

import { prisma } from './db';
import { submitClaim, disputeClaim, generateWakamCertificateHTML } from './claims';

describe('Claims Service — Host RBAC, 48h Window & Guest Dispute', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('submitClaim', () => {
		it('should submit a claim successfully when executed by Host within 48h window', async () => {
			const recentEndDate = new Date(Date.now() - 10 * 3600 * 1000); // 10 hours ago

			const mockBooking = {
				id: 'booking-1',
				guestId: 'guest-1',
				endDate: recentEndDate,
				insurancePolicy: {
					id: 'policy-1',
					policyNumber: 'WAK-2026-89412',
					status: 'ACTIVE'
				},
				listing: {
					hostId: 'host-owner-1'
				}
			};

			vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as any);
			vi.mocked(prisma.insurancePolicy.update).mockResolvedValue({
				id: 'policy-1',
				policyNumber: 'WAK-2026-89412',
				status: 'CLAIMED'
			} as any);
			vi.mocked(prisma.booking.update).mockResolvedValue({} as any);
			vi.mocked(prisma.claim.create).mockResolvedValue({
				id: 'claim-1',
				bookingId: 'booking-1',
				policyNumber: 'WAK-2026-89412',
				estimatedDamage: 1500,
				createdAt: new Date()
			} as any);

			const result = await submitClaim({
				bookingId: 'booking-1',
				userId: 'host-owner-1',
				damageType: 'SOUND_SYSTEM',
				description: 'Le système de sonorisation a subi un court-circuit lors de la soirée.',
				estimatedCost: 1500
			});

			expect(result.bookingId).toBe('booking-1');
			expect(result.policyNumber).toBe('WAK-2026-89412');
			expect(result.status).toBe('SUBMITTED');
			expect(prisma.claim.create).toHaveBeenCalled();
		});

		it('should reject claim submission if user is NOT the host owner (Guest RBAC check)', async () => {
			const mockBooking = {
				id: 'booking-1',
				guestId: 'guest-1',
				endDate: new Date(),
				listing: {
					hostId: 'host-owner-1'
				}
			};

			vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as any);

			await expect(
				submitClaim({
					bookingId: 'booking-1',
					userId: 'guest-1',
					damageType: 'FURNITURE',
					description: 'Description valide de plus de dix caractères',
					estimatedCost: 500
				})
			).rejects.toThrow("Seul l'hôte propriétaire du logement peut déclarer un sinistre.");
		});

		it('should reject claim submission if 7 days post-event window is expired', async () => {
			const oldEndDate = new Date(Date.now() - 8 * 24 * 3600 * 1000); // 8 days ago (> 7 days)

			const mockBooking = {
				id: 'booking-1',
				guestId: 'guest-1',
				endDate: oldEndDate,
				listing: {
					hostId: 'host-owner-1'
				}
			};

			vi.mocked(prisma.booking.findUnique).mockResolvedValue(mockBooking as any);

			await expect(
				submitClaim({
					bookingId: 'booking-1',
					userId: 'host-owner-1',
					damageType: 'STRUCTURE',
					description: 'Description valide de plus de dix caractères',
					estimatedCost: 2000
				})
			).rejects.toThrow('La fenêtre de déclaration de sinistre de 7 jours post-événement est expirée.');
		});
	});

	describe('disputeClaim', () => {
		it('should allow Guest locataire to dispute a claim with evidence', async () => {
			const mockClaim = {
				id: 'claim-1',
				isDisputed: false,
				status: 'CLAIMED',
				booking: {
					guestId: 'guest-1',
					listing: { hostId: 'host-owner-1' }
				}
			};

			vi.mocked(prisma.claim.findUnique).mockResolvedValue(mockClaim as any);
			vi.mocked(prisma.claim.update).mockResolvedValue({
				id: 'claim-1',
				isDisputed: true,
				status: 'UNDER_REVIEW'
			} as any);

			const result = await disputeClaim({
				claimId: 'claim-1',
				userId: 'guest-1',
				disputeReason: 'L appareil etait deja defectueux selon l etat des lieux d entree',
				disputeEvidenceUrls: ['/uploads/etat-des-lieux.png']
			});

			expect(result.isDisputed).toBe(true);
			expect(prisma.claim.update).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { id: 'claim-1' },
					data: expect.objectContaining({ isDisputed: true, status: 'CLAIMED' })
				})
			);
		});

		it('should reject dispute if user is NOT the guest locataire', async () => {
			const mockClaim = {
				id: 'claim-1',
				isDisputed: false,
				booking: {
					guestId: 'guest-1'
				}
			};

			vi.mocked(prisma.claim.findUnique).mockResolvedValue(mockClaim as any);

			await expect(
				disputeClaim({
					claimId: 'claim-1',
					userId: 'other-user-99',
					disputeReason: 'Motif de contestation valide de plus de dix caracteres'
				})
			).rejects.toThrow('Seul le locataire de la réservation peut contester ce sinistre.');
		});
	});

	describe('getClaimByBookingId & generateWakamCertificateHTML', () => {
		it('should return claim with history by bookingId', async () => {
			vi.mocked(prisma.claim.findFirst).mockResolvedValue({ id: 'claim-1', bookingId: 'b-1' } as any);

			const claim = await import('./claims').then((m) => m.getClaimByBookingId('b-1'));
			expect(claim?.id).toBe('claim-1');
		});

		it('should generate official Wakam certificate HTML', async () => {
			const mockBooking = {
				id: 'booking-1',
				startDate: new Date('2026-08-15'),
				endDate: new Date('2026-08-16'),
				guest: { firstName: 'Alexandre', lastName: 'Rivière', email: 'alex@evenue.fr' },
				listing: {
					title: 'Villa Test',
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

			const html = await import('./claims').then((m) => m.generateWakamCertificateHTML('booking-1', 'guest-1'));
			expect(html).toContain('WAK-2026-999');
			expect(html).toContain('10 000,00 €');
			expect(html).toContain('Alexandre Rivière');
		});
	});
});
