import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { sha256 } from '../src/repository.js';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const locations = [
  ['browse', 'app.js', 6, 7, 'Browsing delegates to the store.'],
  ['validate', 'app.js', 9, 11, 'Validate input and reserve stock before payment.'],
  ['checkout', 'app.js', 12, 18, 'Payment, persistence, success, and compensation.'],
  ['list', 'store.js', 7, 8, 'Products and availability are returned.'],
  ['reserve', 'store.js', 10, 15, 'Stock is checked and decremented.'],
  ['release', 'store.js', 16, 18, 'Compensation restores stock.'],
  ['save', 'store.js', 19, 23, 'Orders are stored in memory.'],
  ['payment', 'payment.js', 2, 5, 'Payment stub throws or returns a receipt.']
];
const evidence = await Promise.all(locations.map(async ([id, name, startLine, endLine, reason]) => {
  const p = `examples/shop/${name}`, bytes = await fs.readFile(path.join(root, p));
  return { id, path: p, startLine, endLine, reason, sha256: sha256(bytes), snippet: bytes.toString().split('\n').slice(startLine - 1, endLine).join('\n') };
}));
const observed = (...evidenceIds) => ({ confidence: 'observed', evidenceIds });
const inferred = rationale => ({ confidence: 'inferred', evidenceIds: [], rationale });
const caller = inferred('The fixture exposes backend functions. Customer-facing UI and HTTP transport are not implemented; Customer is a conceptual caller.');
const step = (id, from, to, kind, label, description, proof) => ({ id, from, to, kind, label, description, ...proof });
const entry = step('request', 'customer', 'shop', 'call', 'Submit order', 'A customer supplies a product SKU and payment token.', caller);
const reserve = step('reserve', 'shop', 'stock', 'call', 'Reserve product', 'Checkout reserves stock before payment.', observed('validate', 'reserve'));
const reserved = step('reserved', 'stock', 'shop', 'return', 'Reservation accepted', 'The store decrements quantity and reports success.', observed('reserve'));
const pay = step('charge', 'shop', 'payment', 'call', 'Charge payment token', 'Checkout awaits the injected payment function.', observed('checkout', 'payment'));
const receipt = step('receipt', 'payment', 'shop', 'return', 'Return paid receipt', 'The stub resolves with a demo receipt unless declined.', observed('payment'));
const save = step('save', 'shop', 'stock', 'call', 'Save order', 'Store the receipt and SKU in the in-memory order collection.', observed('checkout', 'save'));
const success = step('created', 'shop', 'customer', 'return', 'Order created · 201', 'Checkout returns the created order and status 201 to its caller.', caller);
const rejected = step('declined', 'payment', 'shop', 'return', 'Payment fails', 'The declined token causes an error, handled by checkout.', observed('payment', 'checkout'));
const model = {
  schemaVersion: '1.0',
  project: { name: 'Little Shop', description: 'A small shop. A few user goals. A complete story behind each one.' },
  analysis: { mode: 'demo', generatedAt: '2026-10-14T15:00:00.000Z', scope: 'Manually authored model of the executable examples/shop fixture. Not an automatic analysis of an external repository.', limitations: ['Customer-to-function interactions are inferred: the fixture has no UI or HTTP server.', 'Stock and orders are in memory. Payment uses a stub, not an external gateway.', 'Concurrency, idempotency, durable compensation, and persistence failures are outside the fixture.', 'Diagrams are static source interpretations, not runtime traces.'] },
  actors: [{ id: 'customer', name: 'Customer' }],
  participants: [{ id: 'customer', name: 'Customer', kind: 'actor' }, { id: 'shop', name: 'Shop application', kind: 'component' }, { id: 'stock', name: 'Store / inventory', kind: 'component' }, { id: 'payment', name: 'Payment stub', kind: 'component' }],
  evidence,
  useCases: [
    { id: 'browse-products', name: 'Browse products', goal: 'Discover available products before deciding what to buy.', actorIds: ['customer'], preconditions: ['The shop has a product inventory.'], postconditions: ['The caller receives product availability.'], ...observed('browse', 'list'), scenarios: [{ id: 'catalog', name: 'View the catalog', outcome: 'Products are returned with an availability flag.', steps: [step('list', 'shop', 'stock', 'call', 'List products', 'Browsing delegates to Store.listProducts().', observed('browse', 'list')), step('products', 'stock', 'shop', 'return', 'Return availability', 'Each product includes its SKU and whether quantity is positive.', observed('list'))] }] },
    { id: 'place-order', name: 'Place an order', goal: 'Buy an available product, pay for it, and receive an order confirmation.', actorIds: ['customer'], preconditions: ['A SKU and payment token are supplied.', 'The selected product has stock.'], postconditions: ['Stock decreases by one.', 'An order containing the receipt is recorded.'], ...observed('validate', 'checkout', 'save'), scenarios: [
      { id: 'happy-path', name: 'Successful checkout', outcome: 'Status 201 and the created order are returned.', steps: [entry, reserve, reserved, pay, receipt, save, success] },
      { id: 'payment-declined', name: 'Payment declined', outcome: 'Status 402 is returned and reserved stock is restored.', steps: [entry, reserve, reserved, pay, rejected, step('release', 'shop', 'stock', 'call', 'Release reserved product', 'The catch block restores stock after payment failure.', observed('checkout', 'release')), step('failed', 'shop', 'customer', 'return', 'Payment declined · 402', 'The caller receives a declined response. No order is saved.', caller)] },
      { id: 'out-of-stock', name: 'Out of stock', outcome: 'Status 409 is returned before payment.', steps: [entry, reserve, step('unavailable', 'stock', 'shop', 'return', 'Reservation rejected', 'Reservation returns false for an unknown or depleted product.', observed('reserve')), step('conflict', 'shop', 'customer', 'return', 'Out of stock · 409', 'Payment and order persistence are skipped.', caller)] },
      { id: 'invalid-input', name: 'Missing input', outcome: 'Status 400 is returned before reserving stock.', steps: [entry, step('invalid', 'shop', 'customer', 'return', 'Missing input · 400', 'Checkout returns early when SKU or token is missing.', caller)] }
    ] },
    { id: 'pay-order', name: 'Pay for an order', goal: 'Obtain a paid receipt as part of checkout.', actorIds: ['customer'], preconditions: ['Stock is reserved.', 'A payment token is supplied.'], postconditions: ['Checkout receives a receipt or handles payment failure.'], ...observed('checkout', 'payment'), scenarios: [{ id: 'paid', name: 'Payment accepted', outcome: 'The stub resolves with a paid receipt.', steps: [pay, receipt] }, { id: 'declined', name: 'Payment rejected', outcome: 'The stub throws an error.', steps: [pay, rejected] }] }
  ],
  relationships: [{ from: 'place-order', to: 'pay-order', kind: 'include', ...observed('checkout', 'payment') }]
};
await fs.writeFile(path.join(root, 'examples/shop/readit.json'), JSON.stringify(model, null, 2) + '\n');
console.log('Demo written with exact hashes and snippets.');
