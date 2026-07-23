import type { LayoutServerLoad } from './$types';
import { prisma } from '$lib/server/db';

export const load: LayoutServerLoad = async ({ cookies }) => {
	const userId = cookies.get('evenue_session');

	if (!userId) {
		return { user: null };
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
				role: true,
				kycStatus: true,
				stripeAccountId: true
			}
		});

		return { user: user || null };
	} catch (error) {
		return { user: null };
	}
};
