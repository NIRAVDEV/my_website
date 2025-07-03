# MythicVault - A Next.js Private Gallery & Rewards App

This is a Next.js application built with Firebase Studio that provides a secure, session-based gallery for your photos and videos, along with a virtual currency and redemption system.

## Key Features

*   **Private Gallery**: Upload and view your photos and videos in a secure, login-protected environment.
*   **Virtual Currency**: Earn "MythicalCoins" by completing tasks.
*   **Redemption System**: Redeem coins for rewards like Google Play codes or UPI transfers.
*   **Admin Panel**: A special panel for administrators to manage user redemption requests.
*   **Local Storage**: Designed to run on a VPS, storing all media directly on the server's filesystem.

---

## Storage and Deployment

### VPS (Virtual Private Server)

When deployed to a VPS, this application saves uploaded photos and videos directly to the server's filesystem in the `public/uploads` directory. This provides persistent storage as long as the server is running and the files are not manually deleted. **This is the recommended approach for a self-hosted setup.**

Redemption requests are currently stored in the browser's `localStorage` for demonstration purposes. For a full production application, you would replace this with a database backend.

### Vercel and Serverless Environments

If you plan to deploy this application to a serverless platform like Vercel, it is **crucial** to understand that their filesystems are **ephemeral**. This means any files uploaded to the `public/uploads` directory will be **lost** when the serverless instance is recycled, which can happen frequently.

For persistent storage on Vercel or similar platforms, you **must** use an external object storage service (like Firebase Storage, AWS S3, Cloudinary, Vercel Blob) and likely a database for redemption requests. You would need to modify the API endpoints in `src/app/api/` and the logic in the redeem/admin pages to use these external services.

---

## Deployment Guide for a VPS (Virtual Private Server)

This guide provides the steps to deploy your MythicVault application on a Linux-based VPS (like Ubuntu).

### Prerequisites

Before you begin, ensure you have the following installed on your VPS:

1.  **Node.js**: Use version 20.x or later. We recommend using `nvm` (Node Version Manager) to manage Node.js versions.
2.  **npm** or **yarn**: The Node.js package manager.
3.  **Git**: To clone the repository.
4.  **PM2**: A process manager to keep your application running in the background. Install it globally: `npm install pm2 -g`
5.  **Nginx** (or Apache): A web server to act as a reverse proxy. `sudo apt update && sudo apt install nginx`

---

### Step 1: Get the Code on Your VPS

Clone your repository onto your VPS.

```bash
git clone <your-repository-url>
cd <your-project-directory>
```

### Step 2: Install Dependencies

Install the necessary Node.js packages.

```bash
npm install
```

### Step 3: Build the Application

Create a production-optimized build of your Next.js app.

```bash
npm run build
```

### Step 4: Run the Application with PM2

Use PM2 to start your application and ensure it runs continuously. The default port for `npm start` is 3000.

```bash
# Start the app with the name "mythic-vault"
pm2 start npm --name "mythic-vault" -- start

# To see the status of your app
pm2 list

# To monitor logs
pm2 logs mythic-vault
```

Your app is now running, but it's likely only accessible on `http://<your-vps-ip>:3000`. The next step makes it accessible on the standard web ports (80/443).

### Step 5: Set Up Nginx as a Reverse Proxy

Configure Nginx to direct traffic from port 80 (and 443 for HTTPS) to your running application on port 3000.

1.  Create a new Nginx configuration file:

    ```bash
    sudo nano /etc/nginx/sites-available/mythic-vault
    ```

2.  Paste the following configuration into the file. Replace `your_domain.com` with your actual domain name or your VPS IP address.

    ```nginx
    server {
        listen 80;
        server_name your_domain.com;

        location / {
            proxy_pass http://localhost:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```

3.  Enable the configuration by creating a symbolic link:

    ```bash
    sudo ln -s /etc/nginx/sites-available/mythic-vault /etc/nginx/sites-enabled/
    ```

4.  Test your Nginx configuration for errors:

    ```bash
    sudo nginx -t
    ```

5.  If the test is successful, restart Nginx to apply the changes:

    ```bash
    sudo systemctl restart nginx
    ```

Your MythicVault application should now be live and accessible via your domain or IP address. For production use, it is highly recommended to also [configure SSL with Let's Encrypt](https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-22-04) to enable HTTPS.

## Available Scripts

-   `npm run dev`: Runs the app in development mode.
-   `npm run build`: Builds the app for production.
-   `npm start`: Starts a production server.
-   `npm run lint`: Lints the code.
