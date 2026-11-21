# KashBites — A Taste of Kashmir

Premium Kashmiri dry fruits, centennial orchard Kagzi walnuts, Mamra almonds, sun-dried apricots, and royal festive hampers sourced directly from Himalayan growers in Shopian and Pulwama.

---

## 🚀 Release & Deployment Guide

KashBites uses an automated CI/CD pipeline via GitHub Actions ([`.github/workflows/release.yml`](.github/workflows/release.yml)) that builds Docker images, pushes them to GitHub Container Registry (GHCR), and deploys the infrastructure to your remote server via SSH.

### 1. Required GitHub Secrets

Before triggering a release, ensure the following repository secrets are configured in GitHub (**Settings** → **Secrets and variables** → **Actions**):

| Secret Name | Description | Example |
| :--- | :--- | :--- |
| `SSH_HOST` | Remote server IP address or domain | `192.0.2.1` or `api.kashbites.in` |
| `SSH_USER` | Remote server SSH username | `root` or `ubuntu` |
| `SSH_KEY` | Private SSH key (matching authorized keys on host) | `-----BEGIN OPENSSH PRIVATE KEY----- ...` |
| `SSH_PORT` *(Optional)* | SSH port (defaults to `22` if not provided) | `22` |

---

### 2. How to Trigger a Release

#### Method A: Push a Release Tag (Recommended)

Any tag pushed matching the pattern `release/*` will automatically trigger the release pipeline:

```bash
# Tag current commit with a release tag
git tag release/v1.0.0

# Push the tag to GitHub to trigger deployment
git push origin release/v1.0.0
```

To release subsequent versions:

```bash
git tag release/v1.0.1
git push origin release/v1.0.1
```

#### Method B: Manual Trigger via GitHub UI

The workflow also supports `workflow_dispatch`:

1. Navigate to: `https://github.com/Pyloris/kashbites/actions`
2. Select **"Build and Push Release Images to GHCR"** from the workflow list.
3. Click **"Run workflow"**, select the `main` branch, and confirm.

---

### 3. What the Release Pipeline Does

When a release is triggered:

1. **Build Images**:
   - Backend image built from [`backend/Dockerfile`](backend/Dockerfile).
   - Frontend production build (Nginx + static Vite bundle) built from [`frontend/Dockerfile`](frontend/Dockerfile).
2. **Push to GHCR**:
   - `ghcr.io/pyloris/kashbites-backend:latest` + `ghcr.io/pyloris/kashbites-backend:<tag>`
   - `ghcr.io/pyloris/kashbites-frontend:latest` + `ghcr.io/pyloris/kashbites-frontend:<tag>`
3. **Deploy via SSH**:
   - Connects to `SSH_HOST` as `SSH_USER` using `SSH_KEY`.
   - Navigates to the `kashbites` project directory.
   - Pulls the newly built images: `docker compose pull`.
   - Restarts the production containers with zero downtime: `docker compose up -d`.

---

## 🔒 Pre-Launch Routing Architecture

The application is currently operating in **Pre-Launch Mode**:

- **Public Visitors (`/` and any other un-prefixed route)**:
  - Renders the single-page **Launching Screen** with a live harvest countdown clock.
  - Visitors can submit their WhatsApp number to reserve an exclusive 20% OFF launch coupon (`KASHLAUNCH20`).
  - Outside visitors cannot access internal pages.
- **Internal Testing (`/prelaunch/*`)**:
  - Customer Storefront: [`/prelaunch`](http://localhost:3000/prelaunch)
  - Catalog: [`/prelaunch/catalog`](http://localhost:3000/prelaunch/catalog)
  - Admin Portal: [`/prelaunch/admin`](http://localhost:3000/prelaunch/admin)
  - Admin Auth: [`/prelaunch/admin/auth`](http://localhost:3000/prelaunch/admin/auth)

---

## 🛠️ Local Development

### Start Local Databases & Storage
```bash
docker compose -f docker-compose.dev.yml up -d
```
Services started:
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`
- **MinIO S3**: `localhost:9000` (Console at `localhost:9001`)

### Start Backend Service
```bash
cd backend
npm install
npm run dev
# Running on http://localhost:5000
```

### Start Frontend Application
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```
