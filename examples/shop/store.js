// Tiny, executable fixture for READIT's demo. No production credentials or APIs.
export class Store {
  constructor() {
    this.stock = new Map([['book', 3], ['keyboard', 0]]);
    this.orders = [];
  }
  listProducts() {
    return [...this.stock].map(([sku, quantity]) => ({ sku, available: quantity > 0 }));
  }
  reserve(sku) {
    const quantity = this.stock.get(sku) || 0;
    if (quantity < 1) return false;
    this.stock.set(sku, quantity - 1);
    return true;
  }
  release(sku) {
    this.stock.set(sku, (this.stock.get(sku) || 0) + 1);
  }
  saveOrder(sku, receipt) {
    const order = { id: `order-${this.orders.length + 1}`, sku, receipt };
    this.orders.push(order);
    return order;
  }
}
