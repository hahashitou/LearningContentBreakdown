import { IIdentity } from "azure-devops-ui/IdentityPicker";
import * as SDK from 'azure-devops-extension-sdk';

export interface IIdentityProps {
    subjectKind: string;
    metaType: string;
    directoryAlias: string;
    domain: string;
    principalName: string;
    mailAddress: string;
    origin: string;
    originId: string;
    displayName: string;
}

export const getOrgUsers = async (orgName: string): Promise<any> => {
    const api = `https://vssps.dev.azure.com/${orgName}/_apis/graph/users?api-version=7.2-preview.1`;
   const aadToken = await getAzToken();
    console.debug('getRecentlyPeoples aadToken:', aadToken);
    const res = await fetch(api, {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Origin': '*',
            "authorization": `Bearer ${aadToken}`,
        }
    });
    console.debug('getRecentlyPeoples response:', res);
    if (!res.ok) {
        throw new Error(`getRecentlyPeoples error: ${res.statusText}`);
    }
    return await res.json();
};

export const getIdentities = async (orgName: string): Promise<IIdentity[]> => {
    const orgUsers = await getOrgUsers(orgName);
    const identities = orgUsers.value as IIdentityProps[];
    return identities.map(identity => ({
        entityId: identity.displayName,
        entityType: identity.subjectKind,
        originDirectory: identity.origin,
        originId: identity.originId,
        displayName: identity.displayName,
        mail: identity.mailAddress
    }));
};

export const getAzToken = async (): Promise<string> => {
    await SDK.ready();
    try {
        const token = await SDK.getAccessToken();
        console.log("Azure DevOps token retrieved successfully:", token);
        return token;
    } catch (error) {
        console.error("Error getting Azure DevOps token:", error);
        return '';
    }
}

