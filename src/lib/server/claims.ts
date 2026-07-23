import { prisma } from './db';

export interface SubmitClaimInput {
	bookingId: string;
	userId: string;
	damageType: 'SOUND_SYSTEM' | 'FURNITURE' | 'STRUCTURE' | 'OTHER';
	description: string;
	estimatedCost: number;
}

export interface ClaimResult {
	claimId: string;
	claimNumber: string;
	bookingId: string;
	policyNumber: string;
	status: 'SUBMITTED' | 'UNDER_REVIEW';
	estimatedCost: number;
	submittedAt: Date;
}

/**
 * Submit an insurance claim for a covered booking.
 * Updates the associated Wakam Insurance Policy status to CLAIMED.
 */
export async function submitClaim(input: SubmitClaimInput): Promise<ClaimResult> {
	if (!input.description || input.description.trim().length < 10) {
		throw new Error('La description du sinistre doit comporter au moins 10 caractères.');
	}

	if (input.estimatedCost <= 0) {
		throw new Error('Le montant estimé des dommages doit être supérieur à 0 €.');
	}

	// 1. Fetch booking with guest, host and insurance policy
	const booking = await prisma.booking.findFirst({
		where: {
			id: input.bookingId,
			OR: [{ guestId: input.userId }, { listing: { hostId: input.userId } }]
		},
		include: {
			listing: true,
			insurancePolicy: true
		}
	});

	if (!booking) {
		throw new Error('Réservation introuvable ou vous n\'êtes pas autorisé à déclarer un sinistre pour cette réservation.');
	}

	if (!booking.insurancePolicy) {
		throw new Error('Aucune police d\'assurance Wakam rattachée à cette réservation.');
	}

	// 2. Update insurance policy status to CLAIMED
	const updatedPolicy = await prisma.insurancePolicy.update({
		where: { id: booking.insurancePolicy.id },
		data: { status: 'CLAIMED' }
	});

	// Also set booking status to DISPUTED
	await prisma.booking.update({
		where: { id: booking.id },
		data: { status: 'DISPUTED' }
	});

	const claimId = `claim-${Date.now()}`;
	const claimNumber = `SIN-WAK-${Math.floor(100000 + Math.random() * 900000)}`;

	return {
		claimId,
		claimNumber,
		bookingId: booking.id,
		policyNumber: updatedPolicy.policyNumber,
		status: 'SUBMITTED',
		estimatedCost: input.estimatedCost,
		submittedAt: new Date()
	};
}

/**
 * Generate official printable HTML certificate for a Wakam Insurance Policy.
 */
export async function generateWakamCertificateHTML(bookingId: string, userId: string): Promise<string> {
	const booking = await prisma.booking.findFirst({
		where: {
			id: bookingId,
			OR: [{ guestId: userId }, { listing: { hostId: userId } }]
		},
		include: {
			listing: {
				include: {
					host: true
				}
			},
			guest: true,
			insurancePolicy: true
		}
	});

	if (!booking || !booking.insurancePolicy) {
		throw new Error('Réservation ou police d\'assurance introuvable.');
	}

	const policy = booking.insurancePolicy;
	const listing = booking.listing;
	const guest = booking.guest;
	const host = listing.host;

	const formatDate = (date: Date) =>
		new Date(date).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: 'long',
			year: 'numeric'
		});

	return `<!DOCTYPE html>
<html lang="fr">
<head>
	<meta charset="UTF-8">
	<title>Certificat d'Assurance Wakam — ${policy.policyNumber}</title>
	<style>
		body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #ffffff; color: #0f172a; margin: 0; padding: 40px; }
		.container { max-width: 800px; margin: 0 auto; border: 2px solid #e2e8f0; border-radius: 16px; padding: 40px; }
		.header { display: flex; justify-content: space-between; align-items: center; border-b: 2px solid #f1f5f9; padding-bottom: 24px; margin-bottom: 32px; }
		.brand { font-size: 24px; font-weight: 900; color: #020617; }
		.badge { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 6px 12px; border-radius: 9999px; font-size: 12px; font-weight: 700; }
		.title-section { text-align: center; margin-bottom: 32px; }
		.title-section h1 { font-size: 22px; font-weight: 800; margin: 0 0 8px 0; }
		.title-section p { font-size: 13px; color: #64748b; margin: 0; }
		.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
		.box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; }
		.box h3 { font-size: 12px; text-transform: uppercase; color: #64748b; margin: 0 0 12px 0; letter-spacing: 0.5px; }
		.box p { font-size: 13px; margin: 4px 0; font-weight: 500; }
		.box p strong { color: #020617; }
		.coverage-table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
		.coverage-table th, .coverage-table td { border: 1px solid #e2e8f0; padding: 12px 16px; text-align: left; font-size: 13px; }
		.coverage-table th { background: #f1f5f9; font-weight: 700; color: #0f172a; }
		.footer { border-t: 1px solid #e2e8f0; pt-24px; font-size: 11px; color: #94a3b8; text-align: center; margin-top: 32px; padding-top: 20px; }
		@media print { body { padding: 0; } .container { border: none; } }
	</style>
</head>
<body>
	<div class="container">
		<div class="header">
			<div class="brand">Evenue × Wakam</div>
			<div class="badge">Police Certifiée Active</div>
		</div>

		<div class="title-section">
			<h1>ATTESTATION D'ASSURANCE ÉVÉNEMENTIELLE</h1>
			<p>Police N° <strong>${policy.policyNumber}</strong> — Emise par Wakam AssurTech SA</p>
		</div>

		<div class="grid">
			<div class="box">
				<h3>Logement & Événement Couvert</h3>
				<p>Lieu : <strong>${listing.title}</strong></p>
				<p>Adresse : ${listing.address}, ${listing.city}</p>
				<p>Période : Du <strong>${formatDate(booking.startDate)}</strong> au <strong>${formatDate(booking.endDate)}</strong></p>
			</div>

			<div class="box">
				<h3>Parties Assurées</h3>
				<p>Hôte Assuré : <strong>${host.firstName} ${host.lastName}</strong></p>
				<p>Invité Souscripteur : <strong>${guest.firstName} ${guest.lastName}</strong> (${guest.email})</p>
				<p>Statut KYC Hôte : ${host.kycStatus}</p>
			</div>
		</div>

		<table class="coverage-table">
			<thead>
				<tr>
					<th>Garantie Incluse</th>
					<th>Plafond de Couverture</th>
					<th>Franchise</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Dommages matériels au bâtiment & mobilier</td>
					<td><strong>10 000,00 €</strong></td>
					<td>0,00 € (prise en charge séquestre)</td>
				</tr>
				<tr>
					<td>Responsabilité civile événementielle & sonorisation</td>
					<td><strong>1 000 000,00 €</strong></td>
					<td>0,00 €</td>
				</tr>
				<tr>
					<td>Protection juridique & recours sinistre</td>
					<td><strong>5 000,00 €</strong></td>
					<td>0,00 €</td>
				</tr>
			</tbody>
		</table>

		<div class="box" style="text-align: center; background: #ecfdf5; border-color: #a7f3d0;">
			<p style="color: #047857; margin: 0; font-weight: 700;">
				✓ Garantie Wakam immédiatement opposable en cas de dégradation ou sinistre pendant la location.
			</p>
		</div>

		<div class="footer">
			Certificat généré automatiquement par la plateforme Evenue (SvelteKit & Prisma Engine).<br>
			Wakam SA — Entreprise d'assurance immatriculée au RCS Paris 562 028 812 — Regulated by ACPR France.
		</div>
	</div>
</body>
</html>`;
}
