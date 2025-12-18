export const config = {
    maxDuration: 10,
};

// Using 'any' to avoid build failures if @vercel/node types are missing in Vercel environment
export default async function handler(req: any, res: any) {
    // CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle Preflight
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { orderId } = req.body;

        if (!orderId) {
            return res.status(400).json({ error: 'Missing orderId' });
        }

        const appId = process.env.CASHFREE_APP_ID;
        const secretKey = process.env.CASHFREE_SECRET_KEY;
        const env = process.env.CASHFREE_ENV || 'sandbox';

        const baseUrl = env === 'production'
            ? 'https://api.cashfree.com/pg/orders'
            : 'https://sandbox.cashfree.com/pg/orders';

        const response = await fetch(`${baseUrl}/${orderId}`, {
            method: 'GET',
            headers: {
                'x-api-version': '2023-08-01',
                'x-client-id': appId || '',
                'x-client-secret': secretKey || ''
            }
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Cashfree Verify Error:', data);
            return res.status(response.status).json({ error: 'Verification Failed', details: data.message });
        }

        // Check status
        const isPaid = data.order_status === 'PAID';

        // Extract plan from order_note (we saved it as "weekly subscription" or "monthly subscription")
        // logic: if note contains "weekly" -> weekly, else monthly
        const plan = (data.order_note && data.order_note.toLowerCase().includes('weekly')) ? 'weekly' : 'monthly';

        return res.status(200).json({
            success: true,
            isPaid,
            status: data.order_status,
            plan,
            currency: data.order_currency,
            amount: data.order_amount
        });

    } catch (error: any) {
        console.error('Handler Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
