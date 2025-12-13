// Cashfree Payment Integration
// Real UPI payments via Cashfree

declare global {
  interface Window {
    Cashfree: {
      load: (config: { mode: 'sandbox' | 'production' }) => Promise<CashfreeInstance>;
    };
  }
}

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

// Initialize Cashfree SDK
let cashfreeInstance: CashfreeInstance | null = null;

const initCashfree = async (): Promise<CashfreeInstance | null> => {
  if (cashfreeInstance) return cashfreeInstance;

  try {
    console.log('Initializing Cashfree SDK (CDN Version)...');

    // Check if script is loaded
    if (typeof window !== 'undefined' && window.Cashfree) {
      // NOTE: Using 'production' mode strictly as per your setup
      cashfreeInstance = await window.Cashfree.load({ mode: 'production' });
      console.log('Cashfree SDK initialized (Production Mode)');
      return cashfreeInstance;
    } else {
      console.error('Cashfree SDK script not loaded in window');
      // Fallback: Try to load it dynamically if missing
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = async () => {
          if (window.Cashfree) {
            cashfreeInstance = await window.Cashfree.load({ mode: 'production' });
            resolve(cashfreeInstance);
          } else {
            resolve(null);
          }
        };
        document.body.appendChild(script);
      });
    }
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
    // Initialize SDK first
    const cashfree = await initCashfree();

    if (!cashfree) {
      onFailure('Payment service could not be loaded. Please refresh.');
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
      redirectTarget: '_modal',
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
