// Cashfree Payment Integration with Vercel Backend
// Real UPI payments via Cashfree
import { load } from '@cashfreepayments/cashfree-js';

interface CashfreeInstance {
  checkout: (config: CheckoutConfig) => Promise<CheckoutResult>;
}

interface CheckoutConfig {
  paymentSessionId: string;
  redirectTarget?: '_self' | '_blank' | '_modal';
}

interface CheckoutResult {
  error?: { message: string };
  paymentDetails?: {
    paymentMessage: string;
  };
}

// API base URL - uses relative path for Vercel
const API_BASE = '/api';

// Cashfree mode
const CASHFREE_MODE: 'sandbox' | 'production' = 'sandbox';

// Initialize Cashfree SDK
let cashfreeInstance: CashfreeInstance | null = null;

const initCashfree = async (): Promise<CashfreeInstance | null> => {
  if (cashfreeInstance) return cashfreeInstance;

  try {
    cashfreeInstance = await load({ mode: CASHFREE_MODE });
    console.log('Cashfree SDK initialized via NPM');
    return cashfreeInstance;
  } catch (error) {
    console.error('Failed to initialize Cashfree:', error);
  }
  return null;
};

// Create order via backend API
const createOrder = async (
  plan: 'weekly' | 'monthly',
  customerName: string,
  customerEmail: string
): Promise<{ orderId: string; paymentSessionId: string } | null> => {
  try {
    const response = await fetch(`${API_BASE}/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan,
        customerName,
        customerEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Order creation failed:', error);
      throw new Error(error.message || 'Failed to create order');
    }

    const data = await response.json();
    return {
      orderId: data.orderId,
      paymentSessionId: data.paymentSessionId,
    };
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Initiate payment
export const initiateCashfreePayment = async (
  plan: 'weekly' | 'monthly',
  customerName: string,
  customerEmail: string,
  onSuccess: (orderId: string, plan: 'weekly' | 'monthly') => void,
  onFailure: (error: string) => void
): Promise<void> => {
  try {
    // Initialize Cashfree SDK
    const cashfree = await initCashfree();

    if (!cashfree) {
      onFailure('Payment service initialization failed. Please try again.');
      return;
    }

    // Create order via backend
    const order = await createOrder(plan, customerName, customerEmail);

    if (!order) {
      onFailure('Failed to create order. Please try again.');
      return;
    }

    console.log('Order created:', order);

    // Open Cashfree checkout
    const result = await cashfree.checkout({
      paymentSessionId: order.paymentSessionId,
      redirectTarget: '_modal', // Opens in modal for better UX
    });

    if (result.error) {
      console.error('Checkout error:', result.error);
      onFailure(result.error.message || 'Payment failed');
    } else if (result.paymentDetails) {
      console.log('Payment successful:', result.paymentDetails);
      onSuccess(order.orderId, plan);
    }
  } catch (error) {
    console.error('Payment error:', error);
    onFailure('An error occurred. Please try again.');
  }
};

// Check payment status
export const checkPaymentStatus = async (orderId: string): Promise<{
  success: boolean;
  status: string;
  message: string;
}> => {
  try {
    const response = await fetch(`${API_BASE}/payment-status?orderId=${orderId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking payment status:', error);
    return {
      success: false,
      status: 'error',
      message: 'Failed to check payment status',
    };
  }
};
