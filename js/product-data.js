/* EGY PACK — Product Studio data.
 *
 * EDITABLE PLACEHOLDERS: no product specification has been confirmed yet.
 * Every spec value is `null`, which the page shows as "يُحدَّد" / "TBC".
 * Replace `null` with the confirmed value as text, in both languages, e.g.
 *   width: { ar: '500 مم', en: '500 mm' }
 *
 * `visual` only controls how the illustrative 3D model looks in the studio.
 * It is not a product dimension and is never shown as a specification.
 */
export const PRODUCTS = [
  {
    id: 'machine',
    nameKey: 'products.p1',
    specs: { width: null, thickness: null, length: null, weight: null, core: null, color: null },
    visual: { radius: 1.0, height: 2.4, core: 0.34, tint: 0xc4d9ee, opacity: 0.8 }
  },
  {
    id: 'hand',
    nameKey: 'products.p2',
    specs: { width: null, thickness: null, length: null, weight: null, core: null, color: null },
    visual: { radius: 0.78, height: 2.2, core: 0.27, tint: 0xc9dcef, opacity: 0.8 }
  },
  {
    id: 'pre-stretched',
    nameKey: 'products.p3',
    specs: { width: null, thickness: null, length: null, weight: null, core: null, color: null },
    visual: { radius: 0.7, height: 2.2, core: 0.27, tint: 0xd6e6f5, opacity: 0.88 }
  },
  {
    id: 'colored-custom',
    nameKey: 'products.p4',
    specs: { width: null, thickness: null, length: null, weight: null, core: null, color: null },
    visual: { radius: 0.9, height: 2.3, core: 0.3, tint: 0x1f3a7a, opacity: 0.35 }
  }
];

export const SPEC_FIELDS = ['width', 'thickness', 'length', 'weight', 'core', 'color'];

export function findProduct(id) {
  return PRODUCTS.find(p => p.id === id) || PRODUCTS[0];
}
