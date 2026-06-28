// api/sslcommerz-init.js
// Vercel Serverless Function — শুরু করে SSLCommerz payment session

const STORE_ID       = 'studi6a407a277501b';
const STORE_PASSWORD = 'studi6a407a277501b@ssl';
const IS_SANDBOX     = true;

const SSL_URL = IS_SANDBOX
  ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
  : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST')   { res.status(405).json({ error: 'Method not allowed' }); return; }

  try {
    const {
      paymentType,   // 'course' | 'book' | 'connection' | 'platform_charge'
      amount,
      productName,
      productId,
      userName,
      userPhone,
      userEmail,
      // Extra fields per type
      tierId,        // for platform_charge (1/2/3)
      connKey,       // for connection
      couponCode,
      successRedirect,   // optional override
      failRedirect,
    } = req.body;

    if (!paymentType || !amount || !userPhone) {
      return res.status(400).json({ error: 'paymentType, amount, userPhone required' });
    }

    // Build transaction ID
    const trnxId = `SA-${paymentType.toUpperCase()}-${Date.now()}`;

    // Determine base URL from request headers
    const host   = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:3000';
    const proto  = req.headers['x-forwarded-proto'] || 'https';
    const base   = `${proto}://${host}`;

    // Build SSLCommerz POST params
    const params = new URLSearchParams({
      store_id:       STORE_ID,
      store_passwd:   STORE_PASSWORD,
      total_amount:   String(amount),
      currency:       'BDT',
      tran_id:        trnxId,

      // Redirect URLs — all go through our verify endpoint
      success_url: `${base}/api/sslcommerz-success?tran_id=${trnxId}&type=${paymentType}`,
      fail_url:    `${base}/api/sslcommerz-fail?tran_id=${trnxId}&type=${paymentType}`,
      cancel_url:  `${base}/api/sslcommerz-fail?tran_id=${trnxId}&type=${paymentType}&reason=cancelled`,
      ipn_url:     `${base}/api/sslcommerz-ipn`,

      // Product info
      product_name:     productName || paymentType,
      product_category: 'education',
      product_profile:  'digital-goods',

      // Customer info
      cus_name:    userName  || 'Studiesaid User',
      cus_email:   userEmail || `${userPhone}@studiesaid.com`,
      cus_add1:    'Bangladesh',
      cus_country: 'Bangladesh',
      cus_phone:   userPhone,

      // Shipping (required by SSLCommerz even for digital)
      ship_name:    userName || 'Studiesaid User',
      ship_add1:    'Bangladesh',
      ship_country: 'Bangladesh',
      ship_city:    'Dhaka',
      shipping_method: 'NO',
      num_of_item:  '1',
    });

    // Store metadata in param (we read it back in success)
    // SSLCommerz allows custom value fields
    params.append('value_a', paymentType);
    params.append('value_b', String(productId || ''));
    params.append('value_c', String(tierId   || connKey || ''));
    params.append('value_d', userPhone);

    // Hit SSLCommerz
    const sslRes  = await fetch(SSL_URL, {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    });

    const sslData = await sslRes.json();

    if (sslData.status === 'SUCCESS' && sslData.GatewayPageURL) {
      return res.status(200).json({
        success:        true,
        gatewayUrl:     sslData.GatewayPageURL,
        sessionkey:     sslData.sessionkey,
        tran_id:        trnxId,
      });
    } else {
      console.error('SSLCommerz init failed:', sslData);
      return res.status(500).json({
        success: false,
        error:   sslData.failedreason || 'SSLCommerz init failed',
        raw:     sslData,
      });
    }

  } catch (err) {
    console.error('sslcommerz-init error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
