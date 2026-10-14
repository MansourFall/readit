import { Store } from './store.js';
import { charge } from './payment.js';

export function createShop(store = new Store(), payment = charge) {
  return {
    browseProducts() {
      return store.listProducts();
    },
    async placeOrder({ sku, token }) {
      if (!sku || !token) return { status: 400, error: 'Missing product or payment token' };
      if (!store.reserve(sku)) return { status: 409, error: 'Out of stock' };
      try {
        const receipt = await payment(token);
        const order = store.saveOrder(sku, receipt);
        return { status: 201, order };
      } catch {
        store.release(sku);
        return { status: 402, error: 'Payment declined' };
      }
    }
  };
}
