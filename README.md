# com

## Project Setup

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd affluence-yield
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## Running Locally

1. **Start the development server**
   ```bash
   npm start
   ```

2. **Access the application**
   - Open your web browser
   - Go to `http://localhost:3000`
   - You should see the login page

3. **Create a test account**
   - Click on "Register" to create a new account
   - Fill in your details and create an account
   - Log in with your credentials

## Deploying to GitHub Pages

To deploy this project to GitHub Pages, you'll need to make some modifications:

1. **Create a new branch called `gh-pages`**
   ```bash
   git checkout -b gh-pages
   ```

2. **Modify the project for static hosting**
   - Remove the `http-server` dependency from `package.json`
   - Update the Supabase configuration to use environment variables
   - Create a `.github/workflows/deploy.yml` file for GitHub Actions

3. **Create GitHub Actions workflow**
   Create a new file `.github/workflows/deploy.yml`:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [ main ]
     workflow_dispatch:

   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         
         - name: Setup Node.js
           uses: actions/setup-node@v2
           with:
             node-version: '20'
             
         - name: Install dependencies
           run: npm install
           
         - name: Deploy to GitHub Pages
           uses: JamesIves/github-pages-deploy-action@4.1.5
           with:
             branch: gh-pages
             folder: .
   ```

4. **Update Supabase Configuration**
   Create a new file `config.js`:
   ```javascript
   const config = {
     SUPABASE_URL: process.env.SUPABASE_URL || 'your-supabase-url',
     SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || 'your-supabase-anon-key'
   };
   ```

5. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" section
   - Select the `gh-pages` branch as the source
   - Save the settings

6. **Set up environment variables**
   - Go to your repository settings
   - Navigate to "Secrets and variables" > "Actions"
   - Add the following secrets:
     - `SUPABASE_URL`: Your Supabase project URL
     - `SUPABASE_ANON_KEY`: Your Supabase anonymous key

7. **Update your HTML files**
   - Replace the direct Supabase script includes with the config file
   - Update all script tags to use the config variables

8. **Push your changes**
   ```bash
   git add .
   git commit -m "Configure for GitHub Pages"
   git push origin gh-pages
   ```

## Important Notes for GitHub Pages Deployment

1. **Security Considerations**
   - Never commit your Supabase credentials directly in the code
   - Use environment variables for sensitive data
   - Enable CORS in your Supabase project settings to allow your GitHub Pages domain

2. **Limitations**
   - GitHub Pages only serves static files
   - No server-side processing is available
   - All API calls must be client-side
   - Real-time features require proper CORS configuration

3. **Troubleshooting**
   - If you see CORS errors, check your Supabase project settings
   - If authentication fails, verify your environment variables
   - If real-time updates don't work, ensure your Supabase real-time features are enabled
   - Check the browser console for any errors

4. **Alternative Hosting Options**
   If you need more features, consider:
   - Vercel (recommended for Next.js projects)
   - Netlify (good for static sites with serverless functions)
   - Heroku (for full-stack applications)
   - AWS Amplify (for AWS-based projects)

