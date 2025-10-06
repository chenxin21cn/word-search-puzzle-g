# Deployment Guide

This project is configured to automatically deploy to Azure Static Web Apps using GitHub Actions CI/CD.

## Azure Static Web Apps Setup

### Prerequisites
1. Azure subscription
2. GitHub repository with AZURE_CREDENTIALS secret configured

### Setting up Azure Static Web Apps in East US Region

1. **Create Azure Static Web App Resource:**
   ```bash
   # Using Azure CLI
   az staticwebapp create \
     --name word-search-puzzle-g \
     --resource-group <your-resource-group> \
     --location "East US 2" \
     --source https://github.com/<your-username>/word-search-puzzle-g \
     --branch main \
     --app-location "/" \
     --output-location "dist" \
     --login-with-github
   ```

2. **Configure GitHub Secret:**
   - Go to your GitHub repository settings
   - Navigate to Secrets and variables > Actions
   - Add a new repository secret named `AZURE_CREDENTIALS`
   - Set the value to your Azure Static Web Apps deployment token

3. **Get the Deployment Token:**
   ```bash
   az staticwebapp secrets list --name word-search-puzzle-g --resource-group <your-resource-group>
   ```

### Deployment Process

The GitHub Actions workflow will automatically:
1. Install Node.js dependencies
2. Build the React application using Vite
3. Deploy to Azure Static Web Apps

### Triggering Deployment

- **Automatic:** Push to `main` branch or create/update pull requests
- **Manual:** Use the "Run workflow" button in GitHub Actions

### Build Configuration

- **Framework:** React with Vite
- **Node.js Version:** 18
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **App Location:** `/`

### Static Web App Configuration

The `staticwebapp.config.json` file configures:
- SPA routing fallback to `/index.html`
- Proper MIME types for assets
- Cache control headers

### Troubleshooting

1. **Build Failures:** Check the GitHub Actions logs for dependency or build issues
2. **Deployment Token Issues:** Ensure the `AZURE_CREDENTIALS` secret is correctly set
3. **Route Issues:** Verify `staticwebapp.config.json` configuration for SPA routing

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally