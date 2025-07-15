# Deploy Firestore Security Rules

To fix the "Missing or insufficient permissions" error, you need to deploy the Firestore security rules to your Firebase project.

## Option 1: Using Firebase Console (Recommended)

### Deploy Firestore Rules:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `todo-list-b2df7`
3. Navigate to **Firestore Database** → **Rules**
4. Replace the existing rules with the content from `firestore.rules`
5. Click **Publish**

**Note:** We're not using Firebase Storage since you're on the Spark plan. Files are processed directly through the AI API instead of being stored.

## Option 2: Using Firebase CLI
If you have Firebase CLI installed:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## The Rules Explained
The security rules ensure that:
- Users can only access their own data
- Authentication is required for all operations
- Data is properly isolated by `userId`

After deploying these rules, your resume upload should work without permission errors.

## Required Firestore Indexes

You also need to create composite indexes for queries. When you see index errors in the console, click the provided link or manually create these indexes:

### Interview Sessions Index
1. Go to [Firebase Console](https://console.firebase.google.com/) → Firestore → Indexes
2. Click "Create Index"
3. Collection: `interviewSessions`
4. Fields:
   - `userId` (Ascending)
   - `createdAt` (Descending)
5. Click "Create"

### Resumes Index  
1. Collection: `resumes`
2. Fields:
   - `userId` (Ascending) 
   - `uploadedAt` (Descending)
3. Click "Create"

Or simply click the links provided in console errors to auto-create the indexes.