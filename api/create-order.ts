// Cashfree Create Order API
// POST /api/create-order

export const config = {
    maxDuration: 10,
};

// Using 'any' to avoid build failures if @vercel/node types are missing in Vercel environment
export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { plan, customerName, customerEmail, customerPhone } = req.body;

        // Validation
        if (!plan || !customerName || !customerEmail) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const phone = customerPhone || '9999999999';
        if (!/^\d{10}$/.test(phone)) {
            return res.status(400).json({ error: 'Phone number must be exactly 10 digits' });
        }

        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const env = process.env.CASHFREE_ENV || 'sandbox';

        if (!appId || !secretKey) {
            console.error('Missing credentials');
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const baseUrl = env === 'production'
            ? 'https://api.cashfree.com/pg/orders'
            : 'https://sandbox.cashfree.com/pg/orders';

        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

        // Use provided amount if valid, otherwise fallback to defaults
        let amount = req.body.amount;
        if (!amount || amount <= 0) {
            amount = plan === 'weekly' ? 99 : 299;
        }

        // Cashfree Prod requires HTTPS for return_url
        // If testing on localhost, redirect to the production Vercel app
        let origin = req.headers.origin || 'https://lluui.vercel.app';
        if (origin.includes('localhost') || origin.startsWith('http://')) {
            origin = 'https://lluui.vercel.app';
        }

        const returnUrl = `${origin}/payment-success?order_id=${orderId}`;

        const payload = {
            order_id: orderId,
            order_amount: amount,
            order_currency: "INR",
            customer_details: {
                customer_id: customerEmail.replace(/[^a-zA-Z0-9]/g, '_'),
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: phone
            },
            order_meta: {
                return_url: returnUrl,
                payment_methods: "cc,dc,ccc,ppc,nb,upi,paypal,emi"
            },
            order_note: `${plan} subscription`
        };

        console.log(`Sending Order Request to ${baseUrl}`);

        // Note: Node 18+ has native fetch. If Vercel environment is older, we might need 'node-fetch'
        // But usually Vercel Node functions support fetch now.
        // If this fails, we will know.
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

        // 🔍 Debug Logs
        console.log('=== BACKEND DEBUG ===');
        console.log('Original Session ID:', data.payment_session_id);

        if (!response.ok) {
            console.error('Cashfree API Error:', data);
            return res.status(response.status).json({ error: 'Payment Gateway Error', details: data.message });
        }

        return res.status(200).json({
            success: true,
            orderId: data.order_id,
            paymentSessionId: data.payment_session_id,
            cfOrderId: data.cf_order_id,
        });

    } catch (error: any) {
        console.error('Handler Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
