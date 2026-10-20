/** Matches the PATCH endpoints: /api/orders/{id}/{action} */
export type OrderAction = 'confirm' | 'preparing' | 'ready' | 'delivering' | 'complete' | 'cancel';
