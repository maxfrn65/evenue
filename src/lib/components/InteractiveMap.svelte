<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	// Self-host Leaflet CSS from the npm package instead of an external CDN
	// (OWASP A05: removes a third-party origin with no SRI from the page).
	import 'leaflet/dist/leaflet.css';

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

		const L = (await import('leaflet')).default;

		mapInstance = L.map(mapElement).setView([46.603354, 1.888334], 6);

		// Clean Voyager light map tiles from CartoDB
		L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
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

		mapInstance.eachLayer((layer: any) => {
			if (layer instanceof L.Marker) {
				mapInstance.removeLayer(layer);
			}
		});

		const bounds: any[] = [];

		listings.forEach((item) => {
			if (item.latitude && item.longitude) {
				bounds.push([item.latitude, item.longitude]);

				// Custom black pill pin marker for prices
				const customIcon = L.divIcon({
					className: 'custom-map-pin',
					html: `<div style="background:#020617;color:white;padding:4px 10px;border-radius:20px;font-size:11px;font-weight:bold;box-shadow:0 2px 8px rgba(0,0,0,0.15);border:1px solid #ffffff;white-space:nowrap;">${item.pricePerNight} €</div>`,
					iconSize: [50, 24],
					iconAnchor: [25, 12]
				});

				const marker = L.marker([item.latitude, item.longitude], { icon: customIcon }).addTo(mapInstance);

				const popupContent = `
					<div style="font-family:sans-serif;padding:4px;">
						<strong style="display:block;font-size:13px;margin-bottom:4px;color:#0f172a;">${item.title}</strong>
						<span style="font-size:11px;color:#64748b;">${item.city} • Max ${item.maxCapacity} pers.</span>
						<div style="margin-top:8px;display:flex;justify-content:space-between;align-items:center;">
							<strong style="color:#0f172a;font-size:14px;">${item.pricePerNight} € / soirée</strong>
							<a href="/listings/${item.id}" style="background:#020617;color:white;padding:4px 8px;border-radius:6px;font-size:11px;text-decoration:none;font-weight:bold;">Voir</a>
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

<div
	class="w-full h-full rounded-lg overflow-hidden relative border border-slate-200 min-h-[320px]"
	role="region"
	aria-label="Carte interactive des lieux événementiels disponibles"
>
	<div bind:this={mapElement} class="w-full h-full min-h-[320px] bg-slate-100"></div>
</div>
