import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const fn = functions.region('europe-west1');
const firestore = admin.firestore();

export const checkForUpdate = fn.https.onRequest(async (request, response) => {

    if (request.body.email) {
        const maybeTargetedReleaseUrl = await tryGetTargetReleaseUrl(request.body);
        if (maybeTargetedReleaseUrl) {
            response.send({
                hasUpdate: true,
                update: maybeTargetedReleaseUrl
            });
            return;
        }
    }

    const maybeRegularReleaseUrl = await tryGetRegularReleaseUrl(request.body);
    if (maybeRegularReleaseUrl) {
        response.send({
            hasUpdate: true,
            update: maybeRegularReleaseUrl
        });
        return;
    }

    response.send({
        hasUpdate: false
    });
});

async function tryGetRegularReleaseUrl(checkForUpdateBody: CheckForUpdateBody): Promise<ModuleUpdate | null>  {
    const appReleasesRef = firestore.collection(`applications/${checkForUpdateBody.appId}/modules/${checkForUpdateBody.moduleName}/releases`);
    const newestModuleReleasesSnapshot = await appReleasesRef.orderBy('createdAt','desc').limit(1).get();
    if (newestModuleReleasesSnapshot.empty) {
        return null;
    }

    const newestModuleRelease = newestModuleReleasesSnapshot.docs[0].data() as ModuleUpdate;
    if (!newestModuleRelease || newestModuleRelease.md5 === checkForUpdateBody.currentMd5) {
        return null;
    }

    return {
        modulePath: newestModuleRelease.modulePath,
        md5: newestModuleRelease.md5
    }
}

async function tryGetTargetReleaseUrl(checkForUpdateBody: CheckForUpdateBody): Promise<ModuleUpdate | null>  {
    const docSnapshot = await firestore.doc(`applications/${checkForUpdateBody.appId}/targeted-users/${checkForUpdateBody.email.toLowerCase()}`).get();
    if (!docSnapshot.exists) {
        return null;
    }

    const targetedUserData = docSnapshot.data()!;
    const maybeTargetedUserModule = targetedUserData[`modules.${checkForUpdateBody.moduleName}`] as ModuleUpdate;
    if (!maybeTargetedUserModule || maybeTargetedUserModule.md5 === checkForUpdateBody.currentMd5) {
        return null;
    }

    return {
        modulePath: maybeTargetedUserModule.modulePath,
        md5: maybeTargetedUserModule.md5
    }
}

type CheckForUpdateBody = {
    email: string;
    appId: string;
    moduleName: string;
    currentMd5: string;
}

type ModuleUpdate = {
    md5: string;
    modulePath: CloudStoragePath;
}

type CloudStoragePath = string;