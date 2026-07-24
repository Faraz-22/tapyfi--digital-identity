type CheckoutIntentInput = {
  provider: "stripe" | "razorpay";
  currency: string;
  amount: number;
  orderId: string;
};

export async function createCheckoutIntent(input: CheckoutIntentInput) {
  if (input.provider === "stripe") {
    return {
      provider: "stripe",
      clientSecret: "stripe_client_secret_placeholder",
      orderId: input.orderId,
      amount: input.amount,
      currency: input.currency
    };
  }

  return {
    provider: "razorpay",
    razorpayOrderId: "razorpay_order_placeholder",
    orderId: input.orderId,
    amount: input.amount,
    currency: input.currency
  };
}
