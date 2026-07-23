import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '../../routes/api/upload/+server';

// Mock fs/promises
vi.mock('node:fs/promises', () => ({
	mkdir: vi.fn().mockResolvedValue(undefined),
	writeFile: vi.fn().mockResolvedValue(undefined)
}));

describe('Upload API Endpoint — POST /api/upload', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should return 401 if request is unauthenticated', async () => {
		const mockEvent: any = {
			request: {
				formData: vi.fn()
			},
			cookies: {
				get: vi.fn().mockReturnValue(null)
			}
		};

		const response = await POST(mockEvent);
		const data = await response.json();

		expect(response.status).toBe(401);
		expect(data.success).toBe(false);
		expect(data.error).toBe('Non authentifié.');
	});

	it('should save uploaded image files and return upload URLs', async () => {
		const mockFile = new File(['fake-image-bytes'], 'venue-photo.png', { type: 'image/png' });
		const formDataMock = {
			getAll: vi.fn().mockReturnValue([mockFile]),
			get: vi.fn()
		};

		const mockEvent: any = {
			request: {
				formData: vi.fn().mockResolvedValue(formDataMock)
			},
			cookies: {
				get: vi.fn().mockReturnValue('host-user-1')
			}
		};

		const response = await POST(mockEvent);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data.success).toBe(true);
		expect(data.urls).toHaveLength(1);
		expect(data.urls[0]).toContain('/uploads/listings/');
	});
});
