# Description

This repository is one of the main architectural components of Chatty Webviews' over-the-air updates support.
The core of this repository is a Firebase Cloud Function called by the mobile SDK's in order to check for new application updates and provide the download URL when new application versions are available.

# Infrastructure setup

As the Chatty Webviews backend is fully free and open source, in order to use it, you should set up your own Firebase account for storing the metadata and content of new application releases. 

After setting up a Firebase account, if you haven't already, you should enable the Authentication, Firestore Database, and Storage services by following the exact steps in Firebase.

After that, you should invoke `firebase deploy --only functions` in order to deploy the Cloud Functions. Additional info could be found in [the Firebase documentation](https://firebase.google.com/docs/functions/get-started#deploy-functions-to-a-production-environment).