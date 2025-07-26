# Neo Drive Setup Guide

This guide will walk you through setting up the Neo Drive application from scratch.

## Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Docker](https://www.docker.com/) and Docker Compose

> **Note**: This guide uses `pnpm` for the server and `bun` for the client as examples, but you can use any package manager you prefer (npm, yarn, pnpm, or bun). Just replace the commands accordingly.

## 1. Clone the Repository

```bash
git clone https://github.com/byakuDNY/neoDrive.git
cd neo-drive
```

## 2. Start Docker Services

First, start the required services (MongoDB and MinIO) using Docker Compose:

```bash
cd docker
docker-compose up -d
```

This will start:

- **MongoDB** on port `27017`
- **Mongo Express** (database UI) on port `8081`
- **MinIO** (S3-compatible storage) on port `9000`
- **MinIO Console** on port `9001`

### Verify Docker Services

- MongoDB: `mongodb://root:example@localhost:27017`
- Mongo Express: <http://localhost:8081>
- MinIO API: <http://localhost:9000>
- MinIO Console: <http://localhost:9001> (user: `user`, password: `password`)

## 3. Configure Server Environment

Navigate to the server directory and set up environment variables:

```bash
cd ../server
cp .env.example .env
```

Edit the `.env` file and configure the following variables:

```bash
# MONGO_DB
MONGODB_URL=mongodb://root:example@localhost:27017

# S3 BUCKET (MinIO configuration)
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=my-bucket
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-001

# STRIPE (Get these from your Stripe dashboard)
STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Setting up Stripe

1. Create a [Stripe account](https://stripe.com/)
2. Get your API keys from the Stripe Dashboard
3. For webhooks, create an endpoint in your Stripe dashboard pointing to your server
4. Copy the webhook secret to your `.env` file

### Setting up MinIO Bucket

1. Access MinIO Console at <http://localhost:9001>
2. Login with credentials: `user` / `password`
3. Create a bucket named `my-bucket` (or whatever you specified in S3_BUCKET)
4. Get the access key and secret key from the access keys tab
5. Set the bucket from private to public

## 4. Install Server Dependencies

```bash
# In the server directory
# Choose one of the following:
pnpm install    # if using pnpm
# npm install   # if using npm
# yarn install  # if using yarn
# bun install   # if using bun
```

## 5. Configure Client Environment

Navigate to the client directory and set up environment variables:

```bash
cd ../client
cp .env.local.example .env.local
```

Edit the `.env.local` file with your configuration:

```bash
VITE_API_URL=http://localhost:3000
```

## 6. Install Client Dependencies

```bash
# In the client directory
# Choose one of the following:
bun install     # if using bun
# npm install   # if using npm
# yarn install  # if using yarn
# pnpm install  # if using pnpm
```

## 7. Start the Development Servers

### Start the Server (Backend)

```bash
# In the server directory
# Choose one of the following:
pnpm dev        # if using pnpm
# npm run dev   # if using npm
# yarn dev      # if using yarn
# bun dev       # if using bun
```

The server should start on `http://localhost:3000` (or the port specified in your server configuration).

### Start the Client (Frontend)

```bash
# In the client directory
# Choose one of the following:
bun dev         # if using bun
# npm run dev   # if using npm
# yarn dev      # if using yarn
# pnpm dev      # if using pnpm
```

The client should start on `http://localhost:5173` (default Vite port).

## 8. Verify the Setup

1. **Client**: Open <http://localhost:5173> in your browser
2. **Server**: Check if API endpoints are responding at <http://localhost:3000>
3. **Database**: Verify MongoDB connection through Mongo Express at <http://localhost:8081>
4. **Storage**: Verify MinIO is accessible at <http://localhost:9001>
