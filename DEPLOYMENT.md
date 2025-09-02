# Deployment Instructions for Vercel

## Environment Variables Required

Set these environment variables in your Vercel dashboard:

```
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBW4b_j--atuUTJCHWAxqRxpwJD2ZJ1T5A
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=queuing-bd0b4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=queuing-bd0b4
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=queuing-bd0b4.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=40222817161
NEXT_PUBLIC_FIREBASE_APP_ID=1:40222817161:web:cb6692ec8e453ced0fbf58
```

## Deployment Steps

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add the environment variables above
4. Deploy

## Local Development

1. Create a `.env.local` file with the environment variables above
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development server
