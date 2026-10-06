#!/usr/bin/env bash
# Sobe Gemini/imagens falsos + Stripe falso + app (build já feito) e roda os testes e2e. Uso: bash tests/e2e/run.sh
set -u
cd "$(dirname "$0")/../.."
PORT=4010 node tests/e2e/fake-gemini.mjs > /tmp/fake-gemini.log 2>&1 &
G=$!
PORT=4020 node tests/e2e/fake-stripe.mjs > /tmp/fake-stripe.log 2>&1 &
S=$!
POLLINATIONS_BASE_URL=http://localhost:4010 STRIPE_API_BASE=http://localhost:4020 STRIPE_SECRET_KEY=sk_test_x STRIPE_WEBHOOK_SECRET=whsec_test STRIPE_PRICE_MISTICO_MONTHLY=price_mistico_m EMAIL_LOG_TO_CONSOLE=1 npx next start -p 3000 > /tmp/next.log 2>&1 &
N=$!
trap 'kill $G $S $N 2>/dev/null' EXIT
for i in $(seq 1 30); do curl -sf localhost:3000/api/health >/dev/null && break; sleep 1; done
node tests/e2e/smoke.mjs && node tests/e2e/auth-flow.mjs && node tests/e2e/stripe-webhook.mjs && node tests/e2e/payments.mjs
