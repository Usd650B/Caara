# Firebase Storage Rules Deployment

## Current Issue
The Firebase Storage rules need to be deployed to allow image uploads. The current error is:
```
Firebase Storage: User does not have permission to access 'products/...'
```

## Manual Deployment Steps

### Option 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `caara-b598f`
3. Navigate to Storage → Rules
4. Replace the existing rules with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Product images - read access for everyone, write access for authenticated users
    match /products/{productId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Allow public write access for development (TEMPORARY - remove in production)
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if true; // Temporary for development
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

5. Click "Publish"

### Option 2: Firebase CLI (If permissions are fixed)
```bash
firebase deploy --only storage
```

## After Deployment
Once the rules are deployed, image uploads should work properly in the admin panel.

## Security Note
The current rules allow public write access for development. For production, you should:
1. Remove the temporary public write access rule
2. Implement proper authentication
3. Use more restrictive rules based on user roles
