# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## Run Locally

**Prerequisites:** Node.js

1.  Install dependencies:
    `npm install`
2.  Run the app using the Vercel CLI for serverless function support:
    `vercel dev`

## Deploying to Vercel

To deploy your application, you can use Vercel.

1.  Push your code to a Git repository (GitHub, GitLab, Bitbucket).
2.  Import your project into Vercel.
3.  Set the following environment variables in your Vercel project settings:
    -   `VITE_OPENWEATHERMAP_API_KEY`: Your API key for OpenWeatherMap.
    -   `GEMINI_API_KEY`: Your API key for the Gemini API.
4.  Vercel will automatically build and deploy your application.
