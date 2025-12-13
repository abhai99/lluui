// Cashfree Create Order API
// POST /api/create-order
import { Cashfree } from "cashfree-pg";

// Switch to Node.js runtime for SDK compatibility
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

        // Validate request
        if (!plan || !customerName || !customerEmail) {
            return new Response(
                JSON.stringify({ error: 'Missing required fields' }),
                { status: 400, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Credentials
        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const env = process.env.CASHFREE_ENV || 'sandbox';

        if (!appId || !secretKey) {
            return new Response(
                JSON.stringify({ error: 'Server configuration error: Missing credentials' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Initialize Cashfree SDK (v5+ syntax)
        // User doc: var cashfree = new Cashfree(Cashfree.SANDBOX, "<x-client-id>", "<x-client-secret>")

        // Use 'any' cast to access static properties if TypeScript definitions are missing/outdated
        const CF = Cashfree as any;
        const cashfreeEnv = env === 'production' ? CF.PRODUCTION : CF.SANDBOX;

        // Instantiate Cashfree SDK
        // @ts-ignore
        const cashfreeInstance = new Cashfree(cashfreeEnv, appId, secretKey);

        // Generate Order ID
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const amount = plan === 'weekly' ? 99 : 299;
        const returnUrl = `${request.headers.get('origin') || 'http://localhost:8080'}/payment-success?order_id=${orderId}`;

        const orderRequest = {
            order_amount: amount,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: customerEmail.replace(/[^a-zA-Z0-9]/g, '_'),
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone || '9999999999'
            },
            order_meta: {
                return_url: returnUrl,
                payment_methods: "cc,dc,ccc,ppc,nb,upi,paypal,emi" // Enable all methods or restricted list
            },
            order_note: `${plan} subscription`
        };

        console.log(`Creating Order ${orderId} in ${env} mode...`);

        // Create Order
        // v5 call signature: PGCreateOrder(request) - No version string argument
        const response = await cashfreeInstance.PGCreateOrder(orderRequest);

        const orderData = response.data;
        console.log('Order created successfully:', orderData.cf_order_id);

        return new Response(
            JSON.stringify({
                success: true,
                orderId: orderData.order_id,
                paymentSessionId: orderData.payment_session_id,
                cfOrderId: orderData.cf_order_id,
            }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );

    } catch (error: any) {
        console.error('Order Creation Error:', error.response?.data?.message || error.message);
        return new Response(
            JSON.stringify({
                error: 'Failed to create order',
                details: error.response?.data?.message || error.message
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }
}
