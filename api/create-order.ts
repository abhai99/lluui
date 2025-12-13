// Cashfree Create Order API
// POST /api/create-order
// Uses direct fetch instead of SDK for max performance on Vercel

export const config = {
    maxDuration: 10,
};

interface OrderRequest {
    plan: 'weekly' | 'monthly';
    customerName: string;
    customerEmail: string;
    customerPhone?: string;
}

export default async function handler(request: Request) {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405, headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        const body: OrderRequest = await request.json();
        const { plan, customerName, customerEmail, customerPhone } = body;

        // Configuration
        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const env = process.env.CASHFREE_ENV || 'sandbox';

        if (!appId || !secretKey) {
            return new Response(
                JSON.stringify({ error: 'Server configuration error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        const baseUrl = env === 'production'
            ? 'https://api.cashfree.com/pg/orders'
            : 'https://sandbox.cashfree.com/pg/orders';

        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const amount = plan === 'weekly' ? 99 : 299;
        const returnUrl = `${request.headers.get('origin') || 'http://localhost:8080'}/payment-success?order_id=${orderId}`;

        // Prepare request payload
        const payload = {
            order_id: orderId,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: customerEmail.replace(/[^a-zA-Z0-9]/g, '_'),
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone || '9999999999'
            },
            order_meta: {
                return_url: returnUrl,
                payment_methods: "cc,dc,ccc,ppc,nb,upi,paypal,emi"
            },
            order_note: `${plan} subscription`
        };

        console.log(`Sending Order Request to ${baseUrl}`);

        // Direct Fetch Call
        const response = await fetch(baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-version': '2023-08-01',
                'x-client-id': appId,
                'x-client-secret': secretKey
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Cashfree API Error:', data);
            return new Response(
                JSON.stringify({ error: 'Payment Gateway Error', details: data.message }),
                { status: response.status, headers: { 'Content-Type': 'application/json' } }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                orderId: data.order_id,
                paymentSessionId: data.payment_session_id,
                cfOrderId: data.cf_order_id,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Handler Error:', error);
        return new Response(
            JSON.stringify({ error: 'Internal Server Error', details: error.message }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
