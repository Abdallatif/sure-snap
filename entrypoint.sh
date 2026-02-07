#!/bin/sh
set -e

# ── Optional API proxy snippet ──────────────────────────────────
if [ -n "$SURE_API_UPSTREAM" ]; then
  cat > /etc/nginx/snippets/api-proxy.conf <<EOF
location /api/ {
    proxy_pass ${SURE_API_UPSTREAM};
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
}
EOF
else
  # Empty file so the include directive doesn't fail
  : > /etc/nginx/snippets/api-proxy.conf
fi

# ── Copy nginx config (no env var substitution needed) ──────────
cp /etc/nginx/templates/default.conf.template /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
