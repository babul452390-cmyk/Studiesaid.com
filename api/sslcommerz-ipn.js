// api/sslcommerz-ipn.js
// Instant Payment Notification — SSLCommerz calls this server-to-server
// Use this to auto-unlock access without waiting for redirect

const STORE_ID       = 'studi6a407a277501b';
const STORE_PASSWORD = 'studi6a407a277501b@ssl';
const IS_SANDBOX     = true;

const VERIFY_URL = IS_SANDBOX
  ? 'https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php'
  : 'https://securepay.sslcommerz.com/validator/api/validationserverAPI.php';

export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return; }

  const body   = req.body || {};
  const val_id = body.val_id;
  const tran_id= body.tran_id;

  if (!val_id) { res.status(400).json({ error: 'no val_id' }); return; }

  try {
    const verifyParams = new URLSearchParams({
      val_id,
      store_id:     STORE_ID,
      store_passwd: STORE_PASSWORD,
      format:       'json',
    });

    const verifyRes  = await fetch(`${VERIFY_URL}?${verifyParams.toString()}`);
    const verifyData = await verifyRes.json();

    const isValid = (
      verifyData.status === 'VALID' || verifyData.status === 'VALIDATED'
    ) && verifyData.tran_id === tran_id;

    if (!isValid) {
      console.warn('IPN verification failed:', verifyData.status, tran_id);
      res.status(200).json({ received: true, verified: false });
      return;
    }

    // ── Extract metadata ──
    const paymentType  = verifyData.value_a || '';
    const productId    = verifyData.value_b || '';
    const tierOrKey    = verifyData.value_c || '';
    const userPhone    = verifyData.value_d || '';
    const amount       = verifyData.amount  || 0;
    const bankTranId   = verifyData.bank_tran_id || '';

    // ── Log to console (Vercel logs) ──
    console.log('✅ IPN verified:', {
      tran_id, paymentType, productId, tierOrKey, userPhone, amount, bankTranId,
    });

    // ── If Firebase Admin SDK is available, update Firestore here ──
    // (Optional — frontend redirect already handles localStorage unlock.
    //  Add Firebase Admin SDK integration here for production.)
    //
    // Example (requires firebase-admin package + service account env vars):
    // const admin = require('firebase-admin');
    // await admin.firestore().collection('verified_payments').doc(tran_id).set({
    //   paymentType, productId, tierOrKey, userPhone, amount, bankTranId,
    //   verifiedAt: admin.firestore.FieldValue.serverTimestamp(),
    //   status: 'verified',
    // });

    res.status(200).json({
      received: true,
      verified: true,
      tran_id,
      paymentType,
      productId,
      amount,
    });

  } catch (err) {
    console.error('sslcommerz-ipn error:', err);
    res.status(500).json({ error: err.message });
  }
}
