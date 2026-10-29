// nimbbl_sonic ships without TypeScript types — the slice of it we use
declare module "nimbbl_sonic" {
  interface CheckoutOpenOptions {
    callback_handler: (response: { event_type?: string; payload?: Record<string, unknown> }) => void;
  }
  export default class Checkout {
    constructor(options: { token: string });
    open(options: CheckoutOpenOptions): void;
  }
}
