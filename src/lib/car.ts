/**
 * The customer's car for curbside pickup: plate, make, model and colour.
 * Ported from the car-pickup mockup. Makes and models come from the US NHTSA vehicle
 * database (vPIC: free, no key) merged with GCC-only models and Chinese brands sold in the UAE.
 */

export type BodyStyle = 'sedan' | 'suv' | 'boxy' | 'sports' | 'pickup';
export type EmirateId = 'dubai' | 'abudhabi' | 'sharjah';
export type CarColor = { name: string; hex: string; custom?: boolean };
export type Car = { emirate: EmirateId; code: string; number: string; make: string; model: string; body: BodyStyle; color: CarColor };

export const EMIRATES: Record<EmirateId, { label: string; codes: string[] }> = {
  dubai: { label: 'Dubai', codes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA', 'BB', 'CC'] },
  abudhabi: { label: 'Abu Dhabi', codes: ['1', '2', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '50'] },
  sharjah: { label: 'Sharjah', codes: ['1', '2', '3', '4'] },
};

export const COLORS: CarColor[] = [
  { name: 'White', hex: '#f4f4f2' }, { name: 'Pearl White', hex: '#ece7dd' }, { name: 'Silver', hex: '#c3c7cb' },
  { name: 'Grey', hex: '#6d7176' }, { name: 'Black', hex: '#1c1d20' }, { name: 'Blue', hex: '#2a5aa8' },
  { name: 'Navy', hex: '#1f3355' }, { name: 'Red', hex: '#b51f24' }, { name: 'Burgundy', hex: '#5e1a24' },
  { name: 'Orange', hex: '#d9661f' }, { name: 'Yellow', hex: '#e5b82a' }, { name: 'Green', hex: '#2f4a3a' },
  { name: 'Beige', hex: '#c9b08a' }, { name: 'Gold', hex: '#b89a62' }, { name: 'Brown', hex: '#5a3d2b' }, { name: 'Matte Black', hex: '#2a2a2c' },
];

/** Starting car for the demo / test account (has a 3D model). */
export const DEMO_CAR: Car = { emirate: 'dubai', code: 'A', number: '12345', make: 'Nissan', model: 'Patrol', body: 'suv', color: COLORS[4] };

/**
 * Real 3D models (Sketchfab). Only models whose licence allows commercial use, shown in the
 * colour they were modelled in. The licences require crediting the author.
 */
export type Model3D = { uid: string; color: string; title: string; author: string; license: string };
export const MODELS_3D: Record<string, Model3D> = {
  'Nissan|Patrol': { uid: '37096fa8cdfe4756b42a4b80e2315d67', color: 'Black', title: 'Nissan Patrol Y62', author: 'Nieve5677', license: 'CC BY' },
  'Mercedes-Benz|G 63': { uid: 'e5e2a1d2238048a1a494b3df983c16bb', color: 'Red', title: 'Mercedes-Benz G63 AMG', author: 'Black Snow', license: 'CC BY' },
};
export const model3dFor = (car: Pick<Car, 'make' | 'model'>) => MODELS_3D[`${car.make}|${car.model}`];

// Display name → name in vPIC (null = not in vPIC; models come from GCC_MODELS only).
export const MAKES: Record<string, string | null> = {
  'Alfa Romeo': 'alfa romeo', 'Aston Martin': 'aston martin', 'Audi': 'audi', 'Bentley': 'bentley', 'BMW': 'bmw',
  'BYD': null, 'Cadillac': 'cadillac', 'Changan': null, 'Chery': null, 'Chevrolet': 'chevrolet', 'Dodge': 'dodge',
  'Exeed': null, 'Ferrari': 'ferrari', 'Ford': 'ford', 'Geely': null, 'Genesis': 'genesis', 'GMC': 'gmc', 'Haval': null,
  'Honda': 'honda', 'Hongqi': null, 'Hyundai': 'hyundai', 'Infiniti': 'infiniti', 'Jaguar': 'jaguar', 'Jeep': 'jeep',
  'Jetour': null, 'Kia': 'kia', 'Lamborghini': 'lamborghini', 'Land Rover': 'land rover', 'Lexus': 'lexus',
  'Lincoln': 'lincoln', 'Lotus': 'lotus', 'Lucid': 'lucid', 'Maserati': 'maserati', 'Mazda': 'mazda', 'McLaren': 'mclaren',
  'Mercedes-Benz': 'mercedes-benz', 'MG': null, 'Mini': 'mini', 'Mitsubishi': 'mitsubishi', 'Nissan': 'nissan',
  'Peugeot': null, 'Polestar': 'polestar', 'Porsche': 'porsche', 'Ram': 'ram', 'Renault': null, 'Rolls-Royce': 'rolls-royce',
  'Subaru': 'subaru', 'Suzuki': null, 'Tank': null, 'Tesla': 'tesla', 'Toyota': 'toyota', 'Volkswagen': 'volkswagen', 'Volvo': 'volvo',
};

const GCC_MODELS: Record<string, [string, BodyStyle][]> = {
  'Toyota': [['Land Cruiser', 'suv'], ['Land Cruiser 70', 'boxy'], ['Prado', 'suv'], ['Fortuner', 'suv'], ['Hilux', 'pickup'], ['Rush', 'suv'], ['Yaris', 'sedan'], ['FJ Cruiser', 'boxy'], ['Innova', 'suv'], ['Hiace', 'suv']],
  'Nissan': [['Patrol', 'suv'], ['Patrol Nismo', 'suv'], ['X-Terra', 'suv'], ['Sunny', 'sedan'], ['Kicks', 'suv'], ['Navara', 'pickup'], ['Sentra', 'sedan']],
  'Lexus': [['LX 600', 'suv'], ['GX 550', 'suv'], ['LM 350h', 'suv']],
  'Mercedes-Benz': [['G 63', 'boxy'], ['G 500', 'boxy'], ['Maybach S-Class', 'sedan']],
  'Mitsubishi': [['Pajero', 'suv'], ['Montero Sport', 'suv'], ['L200', 'pickup'], ['Attrage', 'sedan'], ['ASX', 'suv']],
  'Hyundai': [['Accent', 'sedan'], ['Creta', 'suv'], ['Staria', 'suv']],
  'Kia': [['Pegas', 'sedan'], ['Sonet', 'suv'], ['Mohave', 'suv']],
  'Land Rover': [['Range Rover', 'suv'], ['Range Rover Sport', 'suv'], ['Defender', 'boxy']],
  'Chevrolet': [['Captiva', 'suv'], ['Groove', 'suv']],
  'Ford': [['Territory', 'suv'], ['Everest', 'suv'], ['Ranger Raptor', 'pickup']],
  'Suzuki': [['Swift', 'sedan'], ['Dzire', 'sedan'], ['Jimny', 'boxy'], ['Vitara', 'suv'], ['Ertiga', 'suv'], ['Ciaz', 'sedan']],
  'Peugeot': [['208', 'sedan'], ['2008', 'suv'], ['3008', 'suv'], ['5008', 'suv'], ['Landtrek', 'pickup']],
  'Renault': [['Duster', 'suv'], ['Koleos', 'suv'], ['Megane', 'sedan']],
  'MG': [['MG5', 'sedan'], ['MG ZS', 'suv'], ['MG RX5', 'suv'], ['MG HS', 'suv'], ['MG GT', 'sedan'], ['MG Cyberster', 'sports']],
  'BYD': [['Atto 3', 'suv'], ['Seal', 'sedan'], ['Han', 'sedan'], ['Song Plus', 'suv'], ['Tang', 'suv'], ['Shark', 'pickup']],
  'Geely': [['Coolray', 'suv'], ['Emgrand', 'sedan'], ['Tugella', 'suv'], ['Monjaro', 'suv'], ['Okavango', 'suv']],
  'Changan': [['CS35 Plus', 'suv'], ['CS75 Plus', 'suv'], ['CS85', 'suv'], ['UNI-T', 'suv'], ['UNI-K', 'suv'], ['Alsvin', 'sedan']],
  'Chery': [['Tiggo 4 Pro', 'suv'], ['Tiggo 7 Pro', 'suv'], ['Tiggo 8 Pro', 'suv'], ['Arrizo 6', 'sedan']],
  'Haval': [['Jolion', 'suv'], ['H6', 'suv'], ['H9', 'suv'], ['Dargo', 'boxy']],
  'Jetour': [['Dashing', 'suv'], ['X70 Plus', 'suv'], ['X90 Plus', 'suv'], ['T2', 'boxy']],
  'Tank': [['Tank 300', 'boxy'], ['Tank 500', 'suv']],
  'Exeed': [['LX', 'suv'], ['TXL', 'suv'], ['VX', 'suv'], ['RX', 'suv']],
  'Hongqi': [['H5', 'sedan'], ['H9', 'sedan'], ['HS5', 'suv'], ['E-HS9', 'suv']],
};

/** Default model shown when a make is picked. */
export const POPULAR: Record<string, string> = { 'Toyota': 'Land Cruiser', 'Nissan': 'Patrol', 'Mercedes-Benz': 'G 63', 'Lexus': 'LX 600', 'Land Rover': 'Range Rover', 'Porsche': '911', 'BMW': 'X5', 'Tesla': 'Model Y', 'Ford': 'F-150', 'Chevrolet': 'Tahoe', 'GMC': 'Yukon', 'Mitsubishi': 'Pajero' };

const SPORTS = /\b(911|718|Cayman|Boxster|GT-?R|Mustang|Corvette|Camaro|Challenger|Supra|86|BRZ|MX-5|Miata|AMG GT|SL|M2|M4|M8|Z4|i8|R8|TT|Hurac[aá]n|Aventador|Revuelto|Roma|Portofino|F8|296|SF90|812|Purosangue|Vantage|DB1[12]|DBS|Continental GT|Emira|Evora|720S|750S|Artura|GT|Spectre|Wraith|Dawn|Taycan|Model S Plaid|Cyberster)\b/i;
const BOXY = /\b(G[- ]?(Class|63|500|550)|Defender|Wrangler|Bronco|Land Cruiser 70|FJ Cruiser|Jimny|Tank 300|Dargo|T2)\b/i;

export function bodyFor(name: string, vpicType = ''): BodyStyle {
  if (BOXY.test(name)) return 'boxy';
  if (SPORTS.test(name)) return 'sports';
  if (/truck/i.test(vpicType)) return 'pickup';
  if (/multipurpose|mpv/i.test(vpicType)) return 'suv';
  if (/\b(X[1-7]|Q[2-8]|GL[ABCES]|EQ[ABCES]|RX|NX|UX|GX|LX|Cayenne|Macan|Urus|Bentayga|Cullinan|Levante|Stelvio|SUV|Tahoe|Suburban|Yukon|Escalade|Navigator|Expedition|Explorer|Highlander|4Runner|Sequoia|RAV4|CR-V|Pilot|Palisade|Santa Fe|Tucson|Telluride|Sorento|Sportage|Model [XY])\b/i.test(name)) return 'suv';
  return 'sedan';
}

export type CarModel = { name: string; body: BodyStyle };
const VPIC = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const VPIC_YEAR = 2024;
const catalogue = new Map<string, Promise<CarModel[]>>();

/** All models for a make (cached). Works offline with the GCC list when vPIC can't be reached. */
export function modelsFor(make: string): Promise<CarModel[]> {
  const hit = catalogue.get(make);
  if (hit) return hit;
  const job = (async () => {
    const byName = new Map<string, CarModel>();
    (GCC_MODELS[make] ?? []).forEach(([name, body]) => byName.set(name.toLowerCase(), { name, body }));
    const vpicMake = MAKES[make];
    if (vpicMake) {
      const types = ['car', 'multipurpose passenger vehicle (mpv)', 'truck'];
      const results = await Promise.all(
        types.map((t) =>
          fetch(`${VPIC}/GetModelsForMakeYear/make/${encodeURIComponent(vpicMake)}/modelyear/${VPIC_YEAR}/vehicletype/${encodeURIComponent(t)}?format=json`)
            .then((r) => r.json())
            .then((j: { Results: { Model_Name: string; VehicleTypeName?: string }[] }) => j.Results.map((m) => ({ name: m.Model_Name.trim(), type: m.VehicleTypeName || t })))
            .catch(() => [] as { name: string; type: string }[]),
        ),
      );
      for (const { name, type } of results.flat()) {
        // Skip chassis / fleet variants that customers wouldn't pick.
        if (/cab chassis|chassis|cutaway|incomplete|police|commercial|stripped/i.test(name)) continue;
        const key = name.toLowerCase();
        if (!byName.has(key)) byName.set(key, { name, body: bodyFor(name, type) });
      }
    }
    const list = [...byName.values()].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
    if (!list.length) list.push({ name: 'Other', body: 'sedan' });
    return list;
  })();
  catalogue.set(make, job);
  job.then((l) => l.length <= 1 && !GCC_MODELS[make] && catalogue.delete(make)); // retry later if vPIC was down
  return job;
}

export const plateText = (c: Car) => `${EMIRATES[c.emirate].label} ${c.code} ${c.number || '—'}`;
export const carName = (c: Car) => (c.color.custom ? `${c.make} ${c.model} (custom colour)` : `${c.color.name} ${c.make} ${c.model}`);

/* ---------------- Drawing ---------------- */

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const f = (v: number) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((v) => v.toString(16).padStart(2, '0')).join('');
}
const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return ((n >> 16) * 299 + ((n >> 8) & 255) * 587 + (n & 255) * 114) / 1000 > 150;
};
const esc = (s: string) => s.replace(/[^A-Z0-9 ]/gi, '');

/** UAE plate as SVG markup, drawn at (x, y) with size w×h. */
export function plateSVG(car: Car, x: number, y: number, w: number, h: number) {
  const code = esc(car.code) || '?';
  const num = esc(car.number) || '00000';
  if (car.emirate === 'abudhabi') {
    return `<g transform="translate(${x},${y})">
      <rect width="${w}" height="${h}" rx="3" fill="#fff" stroke="#1a1a1a" stroke-width="1.2"/>
      <rect x="1.5" y="1.5" width="${w * 0.24}" height="${h - 3}" rx="2" fill="#c8102e"/>
      <text x="${w * 0.12 + 1.5}" y="${h * 0.68}" font-size="${h * 0.52}" font-weight="800" fill="#fff" text-anchor="middle" font-family="Inter, system-ui, sans-serif">${code}</text>
      <text x="${w * 0.62}" y="${h * 0.7}" font-size="${h * 0.56}" font-weight="800" fill="#111" text-anchor="middle" font-family="Inter, system-ui, sans-serif" letter-spacing="0.6">${num}</text>
    </g>`;
  }
  const label = car.emirate === 'sharjah' ? 'SHARJAH' : 'DUBAI';
  const tint = car.emirate === 'sharjah' ? '#e9a23b' : '#111';
  return `<g transform="translate(${x},${y})">
    <rect width="${w}" height="${h}" rx="3" fill="#fff" stroke="#1a1a1a" stroke-width="1.2"/>
    <text x="${w * 0.13}" y="${h * 0.7}" font-size="${h * 0.56}" font-weight="800" fill="${tint}" text-anchor="middle" font-family="Inter, system-ui, sans-serif">${code}</text>
    <text x="${w * 0.13}" y="${h * 0.92}" font-size="${h * 0.15}" font-weight="700" fill="#555" text-anchor="middle" font-family="Inter, system-ui, sans-serif">${label}</text>
    <line x1="${w * 0.27}" y1="${h * 0.18}" x2="${w * 0.27}" y2="${h * 0.82}" stroke="#ccc" stroke-width="1"/>
    <text x="${w * 0.64}" y="${h * 0.71}" font-size="${h * 0.58}" font-weight="800" fill="#111" text-anchor="middle" font-family="Inter, system-ui, sans-serif" letter-spacing="0.6">${num}</text>
  </g>`;
}

export const plateBadgeSVG = (car: Car) => `<svg viewBox="0 0 110 30" width="132" height="36" aria-label="Plate ${esc(plateText(car))}">${plateSVG(car, 2, 2, 106, 26)}</svg>`;

/** Rear view of the car in its paint, with the plate. viewBox 0 0 300 200. `id` keeps gradient ids unique. */
export function carSVG(car: Car, id: string, { brakes = false } = {}) {
  const paint = car.color.hex;
  const hi = shade(paint, 0.35), mid = paint, lo = shade(paint, -0.32), deep = shade(paint, -0.55);
  const S = {
    sedan: { roof: 'M92 44 Q150 34 208 44 L232 88 L68 88 Z', body: 'M40 98 Q44 84 68 84 L232 84 Q256 84 260 98 L268 140 Q268 156 252 158 L48 158 Q32 156 32 140 Z', deck: 88, lightY: 104, lightH: 16, plateY: 120, wheelY: 146, wheelH: 34, wide: 1 },
    suv: { roof: 'M76 22 Q150 14 224 22 L242 84 L58 84 Z', body: 'M34 92 Q36 80 58 80 L242 80 Q264 80 266 92 L272 150 Q272 166 256 168 L44 168 Q28 166 28 150 Z', deck: 84, lightY: 96, lightH: 22, plateY: 124, wheelY: 154, wheelH: 38, wide: 1.05, rails: true },
    boxy: { roof: 'M70 16 L230 16 L238 84 L62 84 Z', body: 'M34 88 L266 88 L270 152 Q270 168 254 168 L46 168 Q30 168 30 152 Z', deck: 84, lightY: 96, lightH: 30, plateY: 126, wheelY: 154, wheelH: 40, wide: 1.05 },
    sports: { roof: 'M106 58 Q150 50 194 58 L222 96 L78 96 Z', body: 'M26 110 Q30 94 66 92 L234 92 Q270 94 274 110 L278 142 Q278 156 262 158 L38 158 Q22 156 22 142 Z', deck: 96, lightY: 106, lightH: 10, plateY: 122, wheelY: 144, wheelH: 32, wide: 1.12, spoiler: true, lightbar: true },
    pickup: { roof: 'M84 26 Q150 18 216 26 L230 70 L70 70 Z', body: 'M34 82 L266 82 L272 150 Q272 166 256 168 L44 168 Q28 166 28 150 Z', deck: 74, lightY: 90, lightH: 34, plateY: 132, wheelY: 154, wheelH: 38, wide: 1.05, tailgate: true },
  }[car.body] as { roof: string; body: string; deck: number; lightY: number; lightH: number; plateY: number; wheelY: number; wheelH: number; wide: number; rails?: boolean; spoiler?: boolean; lightbar?: boolean; tailgate?: boolean };

  const wheelW = 34 * S.wide;
  const plateW = 74, plateH = 22;
  return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Rear view of a ${esc(carName(car))}">
    <defs>
      <linearGradient id="${id}p" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hi}"/><stop offset="0.45" stop-color="${mid}"/><stop offset="1" stop-color="${lo}"/></linearGradient>
      <linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#000" stop-opacity="0.28"/><stop offset="0.18" stop-color="#000" stop-opacity="0"/><stop offset="0.82" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.28"/></linearGradient>
      <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3c4650"/><stop offset="1" stop-color="#14191e"/></linearGradient>
      <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff5a52"/><stop offset="1" stop-color="#8f0f12"/></linearGradient>
      <radialGradient id="${id}glow"><stop offset="0" stop-color="#ff3b30" stop-opacity="0.75"/><stop offset="1" stop-color="#ff3b30" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="150" cy="${S.wheelY + S.wheelH - 2}" rx="${128 * S.wide}" ry="9" fill="#000" opacity="0.22"/>
    <rect x="${44 - (S.wide - 1) * 40}" y="${S.wheelY}" width="${wheelW}" height="${S.wheelH}" rx="8" fill="#151517"/>
    <rect x="${256 - wheelW + (S.wide - 1) * 40}" y="${S.wheelY}" width="${wheelW}" height="${S.wheelH}" rx="8" fill="#151517"/>
    ${S.rails ? `<rect x="88" y="16" width="124" height="5" rx="2.5" fill="${deep}"/>` : ''}
    <path d="M${S.lightbar ? 58 : 48} ${S.deck - 10} q-16 -2 -18 8 q10 3 20 0 Z" fill="${lo}"/>
    <path d="M${S.lightbar ? 242 : 252} ${S.deck - 10} q16 -2 18 8 q-10 3 -20 0 Z" fill="${lo}"/>
    <path d="${S.roof}" fill="url(#${id}p)"/>
    <path d="${S.roof}" fill="url(#${id}s)"/>
    <path d="${S.roof}" transform="translate(150 ${S.deck}) scale(0.84 0.78) translate(-150 ${-S.deck})" fill="url(#${id}g)"/>
    <path d="${S.roof}" transform="translate(150 ${S.deck}) scale(0.84 0.78) translate(-150 ${-S.deck})" fill="none" stroke="${deep}" stroke-width="2.5" opacity="0.6"/>
    <path d="M106 ${S.deck - 30} L130 ${S.deck - 30} L116 ${S.deck - 6} L94 ${S.deck - 6} Z" fill="#fff" opacity="0.12"/>
    <path d="M168 ${S.deck - 26} L176 ${S.deck - 26} L168 ${S.deck - 8} L160 ${S.deck - 8} Z" fill="#fff" opacity="0.08"/>
    <path d="${S.body}" fill="url(#${id}p)"/>
    <path d="${S.body}" fill="url(#${id}s)"/>
    <path d="M50 ${S.deck + 6} L250 ${S.deck + 6}" stroke="${hi}" stroke-width="1.5" opacity="0.7"/>
    ${S.spoiler ? `<path d="M70 ${S.deck - 2} L230 ${S.deck - 2} L236 ${S.deck + 4} L64 ${S.deck + 4} Z" fill="${deep}"/>` : ''}
    ${S.tailgate ? `<rect x="50" y="${S.deck + 10}" width="200" height="${S.plateY - S.deck - 14}" rx="4" fill="none" stroke="${lo}" stroke-width="1.5"/><rect x="138" y="${S.deck + 16}" width="24" height="6" rx="3" fill="${deep}"/>` : ''}
    ${S.lightbar
      ? `<rect x="58" y="${S.lightY}" width="184" height="${S.lightH * 0.5}" rx="3" fill="url(#${id}l)"/>`
      : `<rect x="${S.tailgate ? 36 : 48}" y="${S.lightY}" width="${S.tailgate ? 14 : 46}" height="${S.lightH}" rx="5" fill="url(#${id}l)"/>
         <rect x="${S.tailgate ? 250 : 206}" y="${S.lightY}" width="${S.tailgate ? 14 : 46}" height="${S.lightH}" rx="5" fill="url(#${id}l)"/>`}
    <g opacity="${brakes ? 1 : 0}" style="transition:opacity .25s">
      <ellipse cx="72" cy="${S.lightY + S.lightH / 2}" rx="46" ry="24" fill="url(#${id}glow)"/>
      <ellipse cx="228" cy="${S.lightY + S.lightH / 2}" rx="46" ry="24" fill="url(#${id}glow)"/>
      <rect x="128" y="${S.deck - 4}" width="44" height="3" rx="1.5" fill="#ff3b30"/>
    </g>
    <path d="M60 ${S.deck + 12} Q150 ${S.deck + 4} 240 ${S.deck + 12}" stroke="#fff" stroke-width="3" fill="none" opacity="${isLight(paint) ? 0.55 : 0.18}"/>
    <circle cx="150" cy="${S.lightY + S.lightH / 2 - 2}" r="5" fill="none" stroke="${isLight(paint) ? '#9aa0a6' : '#d5d8db'}" stroke-width="1.6"/>
    <rect x="${150 - plateW / 2 - 5}" y="${S.plateY - 4}" width="${plateW + 10}" height="${plateH + 8}" rx="5" fill="${deep}" opacity="0.55"/>
    ${plateSVG(car, 150 - plateW / 2, S.plateY, plateW, plateH)}
    <path d="M${40 - (S.wide - 1) * 30} ${S.plateY + plateH + 8} L${260 + (S.wide - 1) * 30} ${S.plateY + plateH + 8}" stroke="${deep}" stroke-width="5" stroke-linecap="round" opacity="0.8"/>
    ${car.body === 'sports' ? `<circle cx="112" cy="${S.plateY + plateH + 9}" r="5" fill="#2a2a2a" stroke="#888" stroke-width="1.4"/><circle cx="188" cy="${S.plateY + plateH + 9}" r="5" fill="#2a2a2a" stroke="#888" stroke-width="1.4"/>` : ''}
  </svg>`;
}
