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

/**
 * Cars customers can pick: only the ones with a real 3D model ready. Each comes in the colour
 * it was modelled in. Add a car here (and to MODELS_3D) when a commercially licensed model exists.
 */
export const CARS_3D: Pick<Car, 'make' | 'model' | 'body' | 'color'>[] = [
  { make: 'Nissan', model: 'Patrol', body: 'suv', color: { name: 'Black', hex: '#1c1d20' } },
  { make: 'Mercedes-Benz', model: 'G 63', body: 'boxy', color: { name: 'Red', hex: '#b51f24' } },
];

/** Starting car for the demo / test account. */
export const DEMO_CAR: Car = { emirate: 'dubai', code: 'A', number: '12345', ...CARS_3D[0] };

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

/* ---------------- Plate ---------------- */

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
