// api/sslcommerz-fail.js
// SSLCommerz redirects here on payment failure or cancellation

export default async function handler(req, res) {
  const { tran_id, type, reason } = req.query;

  const params = new URLSearchParams({
    ssl_result: 'fail',
    tran_id:    tran_id || '',
    type:       type    || '',
    reason:     reason  || req.body?.error || 'payment_failed',
  }).toString();

  res.writeHead(302, { Location: `/?${params}` });
  res.end();
}
