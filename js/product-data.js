/* EGY PACK — Smart Product Catalog data (official product information).
 *
 * Only verified data is listed here: product name, roll width (when known) and
 * weight range. Thickness, length, core weight, density, stretch %, colors and
 * prices are intentionally absent; add them only once officially confirmed.
 *
 * weight: { min, max } in kg. When min === max the product has a fixed weight.
 * widthCm: null means "not specified" (shown as such, never guessed).
 *
 * `visual` only shapes the illustrative 3D model. Heights follow the known widths
 * (0.048 scene units per cm); diameters are rough illustrations. The jumbo roll
 * has no confirmed width, so its height is illustrative too.
 */
const U = 0.048;   // scene units per cm
const CORE = 0.18; // illustrative core radius

export const PRODUCTS = [
  {
    id: 'jumbo',
    nameKey: 'cat.jumbo', descKey: 'cat.jumbo.desc',
    widthCm: null,
    weight: { min: 30, max: 40 },
    visual: { radius: 0.77, height: 50 * U, core: CORE, tint: 0xc4d9ee, opacity: 0.8, illustrativeWidth: true }
  },
  {
    id: 'r50',
    nameKey: 'cat.r50', descKey: 'cat.r50.desc',
    widthCm: 50,
    weight: { min: 1.5, max: 5 },
    visual: { radius: 0.3, height: 50 * U, core: CORE, tint: 0xc9dcef, opacity: 0.8 }
  },
  {
    id: 'r30',
    nameKey: 'cat.r30', descKey: 'cat.r30.desc',
    widthCm: 30,
    weight: { min: 1, max: 2 },
    visual: { radius: 0.28, height: 30 * U, core: CORE, tint: 0xd0e2f3, opacity: 0.82 }
  },
  {
    id: 'r10',
    nameKey: 'cat.r10', descKey: 'cat.r10.desc',
    widthCm: 10,
    weight: { min: 0.5, max: 0.5 },
    visual: { radius: 0.28, height: 10 * U, core: CORE, tint: 0xd6e6f5, opacity: 0.85 }
  }
];

export const isFixedWeight = p => p.weight.min === p.weight.max;

export function findProduct(id) {
  return PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
}
