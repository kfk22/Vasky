// Delivery areas + fees. Admin can edit via dashboard (persisted in .data/delivery.json).
// Checkout always re-reads this file server-side, so fees can't be forged.
export const defaultDelivery = {
  freeOver: 75,
  // Store's Whish Money wallet number (shown at checkout). Change in Admin → Delivery.
  whish: "03 000 000",
  areas: [
    { id: "beirut", name: "Beirut", fee: 3 },
    { id: "mount-lebanon", name: "Mount Lebanon", fee: 4 },
    { id: "north", name: "North (Tripoli & Akkar)", fee: 5 },
    { id: "south", name: "South (Saida & Tyre)", fee: 5 },
    { id: "bekaa", name: "Bekaa", fee: 6 },
  ],
};

export const PAYMENT_METHODS = [
  { id: "cod", name: "Cash on Delivery", note: "Pay in cash when your order arrives." },
  { id: "whish", name: "Whish Money", note: "Pay with Whish when your order arrives — no prepayment needed." },
];

export const ORDER_STATUSES = ["Pending", "Confirmed", "Preparing", "Out for delivery", "Delivered", "Cancelled"];
