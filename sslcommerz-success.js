// api/sslcommerz-success.js
// SSLCommerz redirects here after successful payment
// We verify with SSLCommerz, then redirect to frontend with result

const STORE_ID       = 'studi6a407a277501b';
const STORE_PASSWORD = 'studi6a407a277501b@ssl';
const IS_SANDBOX     = true;

const VERIFY_URL = IS_SANDBOX
  ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';

export default async function handler(req, res) {
  const { tran_id, type } = req.query;

  // SSLCommerz POSTs payment data to success_url
  let body = req.body || {};

  // Also support GET params (sandbox sometimes sends GET)
  const val_id = body.val_id || req.query.val_id;

  if (!val_id) {
    return redirectToApp(res, 'fail', { tran_id, type, reason: 'no_val_id' });
  }

  try {
    // Verify the payment with SSLCommerz
    const verifyParams = new URLSearchParams({
      val_id,
      store_id:     STORE_ID,
      store_passwd: STORE_PASSWORD,
      format:       'json',
    });

    const verifyRes  = await fetch(`${VERIFY_URL}?${verifyParams.toString()}`);
    const verifyData = await verifyRes.json();

    const isValid = (
      verifyData.status      === 'VALID' ||
      verifyData.status      === 'VALIDATED'
    ) && verifyData.tran_id === tran_id;

    if (!isValid) {
      console.error('SSLCommerz verification failed:', verifyData);
      return redirectToApp(res, 'fail', {
        tran_id, type,
        reason: verifyData.status || 'verification_failed',
      });
    }

    // Payment is genuine — send all relevant data to frontend
    const params = {
      tran_id,
      type:        verifyData.value_a || type,
      product_id:  verifyData.value_b || '',
      tier_or_key: verifyData.value_c || '',
      user_phone:  verifyData.value_d || '',
      amount:      verifyData.amount  || '',
      card_type:   verifyData.card_type || '',
      bank_tran_id:verifyData.bank_tran_id || '',
      status:      'success',
    };

    return redirectToApp(res, 'success', params);

  } catch (err) {
    console.error('sslcommerz-success error:', err);
    return redirectToApp(res, 'fail', { tran_id, type, reason: 'server_error' });
  }
}

function redirectToApp(res, result, params) {
  // Build query string
  const qs = new URLSearchParams({ ssl_result: result, ...params }).toString();

  // Redirect to the main SPA — it reads these params and unlocks access
  res.writeHead(302, { Location: `/?${qs}` });
  res.end();
}
