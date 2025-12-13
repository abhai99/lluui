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
    console.log('Initializing Cashfree SDK (CDN Version 3.0)...');

    // Check if script is loaded
    if (typeof window !== 'undefined' && window.Cashfree) {
      // v3 SDK usage is usually: new Cashfree({ mode: '...' })
      // The user's snippet using .load() might be for the wrapper library

      // @ts-ignore
      cashfreeInstance = new window.Cashfree({ mode: 'production' });

      console.log('Cashfree SDK initialized (Production Mode)');
      return cashfreeInstance;
    } else {
      console.error('Cashfree SDK script not loaded in window');
      return null;
    }
  } catch (error) {
    console.error('Failed to initialize Cashfree:', error);
    // Fallback: try factory function style just in case
    try {
      if (typeof window !== 'undefined' && window.Cashfree) {
        // @ts-ignore
        cashfreeInstance = window.Cashfree({ mode: 'production' });
        return cashfreeInstance;
      }
    } catch (e2) {
      console.error('Fallback init failed:', e2);
    }
  }
  return null;
};

// Create order via backend API
const createOrder = async (
  plan: 'weekly' | 'monthly',
  amount: number,
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
        amount,
        customerName,
        customerEmail,
        customerPhone: '9999999999', // Ensure phone is sent
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Order creation failed:', JSON.stringify(error));
      throw new Error(error.error || error.message || 'Failed to create order');
    }

    const data = await response.json();

    // 🔍 Debug - Check the actual value
    console.log('=== FRONTEND DEBUG ===');
    console.log('Received Session ID:', data.paymentSessionId);

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
  amount: number,
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
    const order = await createOrder(plan, amount, customerName, customerEmail);

    if (!order) {
      onFailure('Failed to create order. Please try again.');
      return;
    }

    console.log('Order created:', order);

    // Open Cashfree checkout
    // Reverting Sanitizer: Testing if original ID works now that Whitelist is approved
    console.log('Using Original Session ID:', order.paymentSessionId);

    const result = await cashfree.checkout({
      paymentSessionId: order.paymentSessionId,
      redirectTarget: '_self',
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
