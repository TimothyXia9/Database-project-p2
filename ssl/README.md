# SSL Certificates

This directory contains SSL certificates for HTTPS configuration.

**SECURITY WARNING**: The `.pem` and `.key` files in this directory contain sensitive cryptographic material and should NEVER be committed to version control.

## Files (Not in Git)

- `cert.pem` - SSL certificate
- `key.pem` - Private key

## Generating Self-Signed Certificates for Development

To generate new self-signed certificates for local development:

```bash
openssl req -x509 -nodes -days 3650 -newkey rsa:2048 \
  -keyout ssl/key.pem \
  -out ssl/cert.pem \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=NEWS System/OU=Development/CN=localhost"
```

## Production Certificates

For production environments, use certificates from a trusted Certificate Authority (CA) like Let's Encrypt.

### Using Let's Encrypt (requires a real domain):

```bash
# Install certbot
sudo apt-get install certbot

# Obtain certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/key.pem
```

## File Permissions

Ensure private keys have restricted permissions:

```bash
chmod 600 ssl/key.pem
chmod 644 ssl/cert.pem
```
