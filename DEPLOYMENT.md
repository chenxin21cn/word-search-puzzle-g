# Azure Deployment Instructions

## Prerequisites

1. Azure account with an active subscription
2. Repository with Azure environment secret configured

## Setting up Azure Static Web Apps

### Step 1: Create Azure Static Web App Resource

1. Go to [Azure Portal](https://portal.azure.com)
2. Click "Create a resource" 
3. Search for "Static Web Apps" and select it
4. Click "Create"
5. Fill in the details:
   - **Subscription**: Your Azure subscription
   - **Resource Group**: Create new or use existing
   - **Name**: `word-search-puzzle-game` (or your preferred name)
   - **Region**: **East US** (as requested)
   - **SKU**: Free (for testing) or Standard (for production)
   - **Source**: GitHub
   - **GitHub Account**: Your account
   - **Organization**: chenxin21cn
   - **Repository**: word-search-puzzle-g
   - **Branch**: main
   - **Build Presets**: Custom
   - **App location**: /
   - **Api location**: (leave blank)
   - **Output location**: dist

6. Click "Review + create" then "Create"

### Step 2: Configure Repository Secret

After creating the Static Web App:

1. In Azure Portal, go to your Static Web App resource
2. In the left menu, click "Manage deployment token"
3. Copy the deployment token
4. Go to your GitHub repository settings
5. Navigate to Environments → Azure
6. Add a new secret:
   - Name: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - Value: (paste the deployment token)

### Step 3: Deploy

The workflow will automatically trigger on:
- Push to main branch
- Pull request to main branch

The app will be available at the URL shown in the Azure Portal under your Static Web App resource.

## Manual Deployment

To deploy manually:

```bash
npm install
npm run build
```

Then upload the `dist` folder contents to Azure Static Web Apps.

## Application Details

This is a React + TypeScript word search puzzle game built with:
- React 19
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components

The application allows users to create custom word puzzles and find hidden words in a grid.