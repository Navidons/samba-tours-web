# VPS Server Configuration for File Uploads

## 🔧 Nginx Configuration

### 1. Edit Nginx Configuration
```bash
# Edit main nginx config or your site config
sudo nano /etc/nginx/nginx.conf
# OR for site-specific config:
sudo nano /etc/nginx/sites-available/sambatours.co
```

### 2. Add/Update These Settings
```nginx
server {
    # File upload limits
    client_max_body_size 100M;         # Max upload size
    client_body_timeout 300s;          # Upload timeout
    client_header_timeout 300s;        # Header timeout
    client_body_buffer_size 128k;      # Buffer size
    
    # Proxy timeouts (if using proxy_pass to Node.js)
    proxy_read_timeout 300s;
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    
    # For large file uploads
    proxy_request_buffering off;       # Don't buffer requests
    proxy_max_temp_file_size 0;        # No temp file limit
    proxy_buffering off;               # Disable response buffering
    
    # Your existing location block
    location / {
        proxy_pass http://localhost:3000;  # Your Node.js app
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Additional headers for uploads
        proxy_set_header Content-Length $content_length;
        proxy_set_header Content-Type $content_type;
    }
    
    # Optional: Dedicated upload endpoint with higher limits
    location /api/admin/gallery/images {
        client_max_body_size 200M;     # Even higher limit for gallery
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_request_buffering off;
        proxy_read_timeout 600s;       # 10 minute timeout for large uploads
    }
}
```

### 3. Test and Reload Nginx
```bash
# Test configuration
sudo nginx -t

# If test passes, reload
sudo systemctl reload nginx

# Check status
sudo systemctl status nginx
```

## 🚀 OpenLiteSpeed Configuration

### 1. Access Admin Panel
```bash
# Usually accessible at:
https://your-server-ip:7080
# Default credentials: admin / 123456
```

### 2. Update These Settings

#### Server Level:
- **Actions → General → General Settings**
  - Max Request Body Size: `100M`
  - Max Dynamic Response Body Size: `100M`

#### Virtual Host Level:
- **Virtual Hosts → [Your Site] → General**
  - Max Request Body Size: `100M`
  - Enable Scripts/ExtApps: Yes

#### Script Handler:
- **Script Handler → Add Type: lsphp81** (or your PHP version)
  - Suffixes: `php`
  - Extra Headers: `X-Forwarded-Proto $scheme`

### 3. Restart OpenLiteSpeed
```bash
sudo systemctl restart lsws
# OR
/usr/local/lsws/bin/lswsctrl restart
```

## 🐧 System Level Configuration

### 1. Update Node.js App Limits
```bash
# If using PM2, update your ecosystem.config.js:
module.exports = {
  apps: [{
    name: 'sambatours',
    script: './server.js',
    env: {
      NODE_ENV: 'production',
      MAX_FILE_SIZE: '100MB',
      REQUEST_TIMEOUT: '300000'
    },
    max_memory_restart: '1G',
    instances: 1
  }]
}
```

### 2. System Limits (if needed)
```bash
# Check current limits
ulimit -a

# Increase file size limits (temporary)
ulimit -f unlimited

# For permanent changes, edit:
sudo nano /etc/security/limits.conf
# Add:
* soft nofile 65536
* hard nofile 65536
* soft fsize unlimited
* hard fsize unlimited
```

## 🔍 Troubleshooting

### 1. Check Error Logs
```bash
# Nginx logs
sudo tail -f /var/log/nginx/error.log

# OpenLiteSpeed logs
sudo tail -f /usr/local/lsws/logs/error.log

# Your app logs (if using PM2)
pm2 logs sambatours
```

### 2. Test Upload Limits
```bash
# Test with curl
curl -X POST \
  -F "galleryId=1" \
  -F "image=@/path/to/test-image.jpg" \
  https://sambatours.co/api/admin/gallery/images/single
```

### 3. Common Error Solutions

#### 413 Request Entity Too Large
- Increase `client_max_body_size` in Nginx
- Check OpenLiteSpeed "Max Request Body Size"

#### 504 Gateway Timeout
- Increase proxy timeouts in Nginx
- Increase script timeout in OpenLiteSpeed

#### Connection Reset
- Add `proxy_request_buffering off;`
- Increase `client_body_timeout`

## ✅ Quick Fix Commands

```bash
# Quick Nginx fix
echo 'client_max_body_size 100M;' | sudo tee -a /etc/nginx/nginx.conf
sudo nginx -t && sudo systemctl reload nginx

# Check if changes took effect
curl -I https://sambatours.co/api/admin/gallery/images

# Monitor logs during upload
sudo tail -f /var/log/nginx/access.log /var/log/nginx/error.log
```

## 🎯 Expected Results

After these changes:
- ✅ 10MB individual files should upload successfully
- ✅ Batch uploads up to 80MB should work
- ✅ No more 413 errors
- ✅ Faster upload processing
- ✅ Better error handling

Test with your `uganda-monkeys.jpg` (3MB) - it should upload quickly and successfully!
