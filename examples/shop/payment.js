// A deterministic payment stub. No external payment request is made.
export async function charge(token) {
  if (token === 'declined') throw new Error('Payment declined');
  return { id: 'receipt-demo', status: 'paid' };
}
