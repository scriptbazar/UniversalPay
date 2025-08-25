
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/setAdminClaim.ts
var admin = require("firebase-admin");
var dotenv = require("dotenv");
var path = require("path");

// Load environment variables from .env file in the root directory
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Get the UID and service account path from environment variables
var uid = process.env.ADMIN_UID;
var serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!uid || !serviceAccountPath) {
    console.error('Error: Please set ADMIN_UID and GOOGLE_APPLICATION_CREDENTIALS in your .env file.');
    process.exit(1);
}

// FIX: Resolve the path relative to the current working directory to get an absolute path.
// This ensures the script can find the file regardless of where it's run from.
var absoluteServiceAccountPath = path.resolve(process.cwd(), serviceAccountPath);

// Initialize the Firebase Admin SDK
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    var serviceAccount = require(absoluteServiceAccountPath);
    
    // Initialize if not already initialized
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        console.log('Firebase Admin SDK initialized successfully.');
    }
}
catch (error) {
    console.error('Error initializing Firebase Admin SDK:', (error as Error).message);
    console.error("Please ensure the path to your service account key ('".concat(serviceAccountPath, "') in your .env file is correct relative to the project root."));
    process.exit(1);
}

// Set the custom claim for the specified user
admin.auth().setCustomUserClaims(uid, { role: 'admin' })
    .then(function () {
    console.log("Successfully set 'admin' role for user: ".concat(uid));
    console.log('Please log out and log back in to the application for the changes to take effect.');
    process.exit(0);
})
    .catch(function (error) {
    console.error('Error setting custom claims:', error);
    process.exit(1);
});
