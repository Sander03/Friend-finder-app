import 'leaflet/dist/leaflet.css';
import type * as Leaflet from 'leaflet';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { isStale } from '../lib/geo';
import { colors } from '../theme';
import type { LiveMapProps } from './LiveMap';
import { Icon } from './primitives/Icon';
import { Spinner } from './primitives/Spinner';

export type { LiveMapProps };

// Namen komen van gebruikers: nooit rechtstreeks in HTML zetten.
const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

// Echte kaart (OpenStreetMap via Leaflet) met jou en je vrienden, zoals in de cursusdemo "pwa-locate-me".
export function LiveMap({ me, members, places, onSelectMember }: LiveMapProps) {
  const container = useRef<View>(null);
  const leaflet = useRef<typeof Leaflet | null>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const layer = useRef<Leaflet.LayerGroup | null>(null);
  const hasFitted = useRef(false);
  const [ready, setReady] = useState(false);
  const onSelect = useRef(onSelectMember);
  onSelect.current = onSelectMember;

  // Leaflet gebruikt `window`, dus we laden het pas in de browser (niet tijdens de statische build).
  useEffect(() => {
    let cancelled = false;
    let resize: ResizeObserver | null = null;
    if (document.getElementById('wbj-map-css') === null) {
      const tag = document.createElement('style');
      tag.id = 'wbj-map-css';
      tag.textContent = css;
      document.head.appendChild(tag);
    }
    import('leaflet').then((L) => {
      const element = container.current as unknown as HTMLElement | null;
      if (cancelled || element === null) return;
      leaflet.current = L;
      const m = L.map(element, { zoomControl: false, attributionControl: true }).setView([me.lat, me.lng], 17);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(m);
      L.control.zoom({ position: 'bottomright' }).addTo(m);
      layer.current = L.layerGroup().addTo(m);
      map.current = m;
      resize = new ResizeObserver(() => m.invalidateSize());
      resize.observe(element);
      setReady(true);
    });
    return () => {
      cancelled = true;
      resize?.disconnect();
      map.current?.remove();
      map.current = null;
    };
    // De kaart maken we één keer; posities werken we hieronder bij.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const located = members.filter((m) => m.location !== null);

  const fitAll = () => {
    const L = leaflet.current;
    if (L === null || map.current === null) return;
    const points: Leaflet.LatLngExpression[] = [[me.lat, me.lng], ...located.map((m) => [m.location!.lat, m.location!.lng] as [number, number])];
    if (points.length === 1) map.current.setView(points[0], 17);
    else map.current.fitBounds(L.latLngBounds(points), { padding: [48, 48], maxZoom: 18 });
  };

  useEffect(() => {
    const L = leaflet.current;
    if (!ready || L === null || layer.current === null) return;
    layer.current.clearLayers();

    for (const place of places) {
      L.circle([place.lat, place.lng], { radius: 10, color: colors.borderStrong, weight: 1, fillColor: colors.surfaceRaised, fillOpacity: 0.8 })
        .bindTooltip(escapeHtml(place.name.toUpperCase()), { permanent: true, direction: 'top', className: 'wbj-place', offset: [0, -8] })
        .addTo(layer.current);
    }

    for (const member of located) {
      const loc = member.location!;
      const stale = isStale(loc.updatedAt);
      if (!stale && loc.accuracy !== null) {
        L.circle([loc.lat, loc.lng], { radius: loc.accuracy, color: member.color, weight: 1, opacity: 0.5, fillOpacity: 0.12 }).addTo(layer.current);
      }
      const initials = escapeHtml(member.name.slice(0, 2).toUpperCase());
      const style = stale
        ? `border:3px dashed ${member.color};color:${member.color};background:${colors.background};opacity:.6`
        : `border:3px solid ${colors.background};color:${colors.onAccent};background:${member.color}`;
      const icon = L.divIcon({
        className: 'wbj-marker',
        html: `<div class="wbj-pin" style="${style}">${initials}</div><div class="wbj-name">${escapeHtml(member.name)}</div>`,
        iconSize: [100, 60],
        iconAnchor: [50, 19],
      });
      L.marker([loc.lat, loc.lng], { icon, title: `${member.name} zoeken`, keyboard: true })
        .on('click', () => onSelect.current(member))
        .addTo(layer.current);
    }

    if (me.accuracy !== null) {
      L.circle([me.lat, me.lng], { radius: me.accuracy, color: colors.accent, weight: 1, opacity: 0.5, fillOpacity: 0.1 }).addTo(layer.current);
    }
    L.marker([me.lat, me.lng], {
      icon: L.divIcon({ className: 'wbj-marker', html: '<div class="wbj-me"></div>', iconSize: [22, 22], iconAnchor: [11, 11] }),
      interactive: false,
      zIndexOffset: 1000,
    }).addTo(layer.current);

    // Eén keer inzoomen zodat iedereen in beeld is; daarna blijft jouw zoom/positie staan.
    if (!hasFitted.current) {
      hasFitted.current = true;
      fitAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, me.lat, me.lng, me.accuracy, members, places]);

  return (
    <View style={styles.wrap}>
      <View ref={container} style={styles.map} accessibilityLabel="Kaart met je vrienden" />
      {!ready && (
        <View style={styles.loading} pointerEvents="none">
          <Spinner size="large" />
        </View>
      )}
      <Pressable
        onPress={fitAll}
        accessibilityRole="button"
        accessibilityLabel="Iedereen in beeld"
        style={({ pressed }) => [styles.fit, pressed && { backgroundColor: colors.surfaceRaised }]}
        testID="fit-map"
      >
        <Icon name="scan-outline" size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}

const css = `
.leaflet-container { background: ${colors.background}; font-family: Inter, system-ui, sans-serif; }
/* OpenStreetMap-tegels donker maken zodat ze bij de app passen. */
.leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.85) contrast(0.9) saturate(0.6); }
.wbj-marker { background: none; border: none; }
.wbj-pin { width: 38px; height: 38px; margin: 0 auto; border-radius: 50%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; font: 700 13px 'Space Grotesk', Inter, sans-serif; cursor: pointer; }
.wbj-name { margin: 4px auto 0; width: max-content; max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: 2px 8px; border-radius: 999px; background: ${colors.background}; color: ${colors.text}; font: 600 12px Inter, sans-serif; }
.wbj-me { width: 22px; height: 22px; box-sizing: border-box; border-radius: 50%; background: #fff; border: 5px solid ${colors.accent}; box-shadow: 0 0 0 10px rgba(198, 244, 50, 0.18); }
.wbj-place { background: transparent; border: none; box-shadow: none; color: #8F95A3; font: 600 11px Inter, sans-serif; letter-spacing: .04em; }
.wbj-place::before { display: none; }
.leaflet-control-attribution { background: rgba(14, 15, 19, 0.7) !important; color: ${colors.textMuted}; font-size: 10px; }
.leaflet-control-attribution a { color: ${colors.textMuted}; }
.leaflet-bar a { background: ${colors.surface}; color: ${colors.text}; border-color: ${colors.border}; }
.leaflet-bar a:hover { background: ${colors.surfaceRaised}; }
`;

const styles = StyleSheet.create({
  wrap: { flex: 1, alignSelf: 'stretch', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  map: { flex: 1 },
  loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  fit: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1000,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
