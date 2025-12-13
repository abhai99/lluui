// Cashfree Create Order API
// POST /api/create-order
// Creates a payment session with Cashfree

export const config = {
    runtime: 'edge',
};

interface OrderRequest {
    plan: 'weekly' | 'monthly';
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
}

interface CashfreeOrderResponse {
    cf_order_id: string;
    order_id: string;
    payment_session_id: string;
    order_status: string;
}

export default async function handler(request: Request): Promise<Response> {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        const body: OrderRequest = await request.json();
        const { plan, customerName, customerEmail, customerPhone } = body;

        // Validate request
        if (!plan || !customerName || !customerEmail) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Calculate amount based on plan
        const amount = plan === 'weekly' ? 99 : 299;

        // Generate unique order ID
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Cashfree API credentials from environment variables
        const appId = process.env.CASHFREE_APP_ID || '80890d10637137583d840feb209808';
        const secretKey = process.env.CASHFREE_SECRET_KEY;

        // Use sandbox or production URL
        const apiUrl = process.env.CASHFREE_ENV === 'production'
            ? 'https://api.cashfree.com/pg/orders'
            : 'https://sandbox.cashfree.com/pg/orders';

        if (!secretKey) {
            // Return error if secret key is not configured
            return new Response(
                JSON.stringify({
                    error: 'Payment configuration error',
                    message: 'CASHFREE_SECRET_KEY environment variable is not set'
                }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Create order with Cashfree
        const cashfreeResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-client-id': appId,
                'x-client-secret': secretKey,
                'x-api-version': '2023-08-01',
            },
            body: JSON.stringify({
                order_id: orderId,
                order_amount: amount,
                order_currency: 'INR',
                customer_details: {
                    customer_id: customerEmail.replace(/[^a-zA-Z0-9]/g, '_'),
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone || '9999999999',
                },
                order_meta: {
                    return_url: `${request.headers.get('origin') || 'http://localhost:8080'}/payment-success?order_id=${orderId}`,
                    notify_url: `${request.headers.get('origin') || 'http://localhost:8080'}/api/payment-webhook`,
                    payment_methods: 'upi',
                },
                order_note: `${plan} subscription - WingoBoss`,
            }),
        });

        if (!cashfreeResponse.ok) {
            const errorData = await cashfreeResponse.text();
            console.error('Cashfree API error:', errorData);
            return new Response(
                JSON.stringify({ error: 'Failed to create order', details: errorData }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const orderData: CashfreeOrderResponse = await cashfreeResponse.json();

        // Return the payment session ID to the frontend
        return new Response(
            JSON.stringify({
                success: true,
                orderId: orderData.order_id,
                paymentSessionId: orderData.payment_session_id,
                cfOrderId: orderData.cf_order_id,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('Order creation error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal server error' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
