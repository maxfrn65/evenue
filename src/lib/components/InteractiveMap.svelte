<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { MapPin } from 'lucide-svelte';

	interface ListingMarker {
		id: string;
		title: string;
		city: string;
		pricePerNight: number;
		latitude: number;
		longitude: number;
		maxCapacity: number;
	}

	let { listings = [] }: { listings?: ListingMarker[] } = $props();

	let mapElement = $state<HTMLDivElement | null>(null);
	let mapInstance = $state<any>(null);

	onMount(async () => {
		if (typeof window === 'undefined' || !mapElement) return;

		// Dynamically import Leaflet in browser only
		const L = (await import('leaflet')).default;

		// Initialize Leaflet map centered over France
		mapInstance = L.map(mapElement).setView([46.603354, 1.888334], 6);

		// Dark theme map tiles from CartoDB Dark Matter
		L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
			attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
			subdomains: 'abcd',
			maxZoom: 19
		}).addTo(mapInstance);

		updateMarkers(L);
	});

	$effect(() => {
		if (mapInstance && listings.length > 0) {
			import('leaflet').then((module) => {
				updateMarkers(module.default);
			});
		}
	});

	function updateMarkers(L: any) {
		if (!mapInstance) return;

		// Clear previous markers
		mapInstance.eachLayer((layer: any) => {
			if (layer instanceof L.Marker) {
				mapInstance.removeLayer(layer);
			}
		});

		const bounds: any[] = [];

		listings.forEach((item) => {
			if (item.latitude && item.longitude) {
				bounds.push([item.latitude, item.longitude]);

				// Custom HTML div marker for prices
				const customIcon = L.divIcon({
					className: 'custom-map-pin',
					html: `<div style="background:#7c3aed;color:white;padding:4px 8px;border-radius:8px;font-size:11px;font-weight:bold;box-shadow:0 4px 12px rgba(124,58,237,0.5);border:1px solid rgba(255,255,255,0.3);white-space:nowrap;">${item.pricePerNight} €</div>`,
					iconSize: [50, 24],
					iconAnchor: [25, 12]
				});

				const marker = L.marker([item.latitude, item.longitude], { icon: customIcon }).addTo(mapInstance);

				const popupContent = `
					<div style="font-family:sans-serif;padding:4px;">
						<strong style="display:block;font-size:13px;margin-bottom:4px;color:#1e293b;">${item.title}</strong>
						<span style="font-size:11px;color:#64748b;">${item.city} • Max ${item.maxCapacity} pers.</span>
						<div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
							<strong style="color:#7c3aed;font-size:14px;">${item.pricePerNight} € / soirée</strong>
							<a href="/listings/${item.id}" style="background:#7c3aed;color:white;padding:4px 8px;border-radius:6px;font-size:11px;text-decoration:none;font-weight:bold;">Voir</a>
						</div>
					</div>
				`;

				marker.bindPopup(popupContent);
			}
		});

		if (bounds.length > 0) {
			mapInstance.fitBounds(bounds, { padding: [40, 40] });
		}
	}

	onDestroy(() => {
		if (mapInstance) {
			mapInstance.remove();
		}
	});
</script>

<div class="w-full h-full rounded-xl overflow-hidden relative border border-white/10 min-h-[320px]">
	<div bind:this={mapElement} class="w-full h-full min-h-[320px] bg-slate-900"></div>
</div>
