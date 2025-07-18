import { IIdentity } from "azure-devops-ui/IdentityPicker";
import * as SDK from 'azure-devops-extension-sdk';

export const getRecentlyPeoples = async (): Promise<any> => {
    const api = 'https://vssps.dev.azure.com/WWLOpsTest/_apis/identities?api-version=7.2-preview.1&searchFilter=General&filterValue=Star%20Cao%20(Wicresoft)';
    const aadToken = await getAzToken();
    const res = await fetch(api, {
        method: 'GET',
        headers: {
            'Access-Control-Allow-Origin': '*',
            "authorization": `Bearer ${aadToken}`,
        }
    });
    if (!res.ok) {
        throw new Error(`getRecentlyPeoples error: ${res.statusText}`);
    }
    return await res.json();
};

export const convertRecentlyPeoplesToIdentities = (data: any): IIdentity[] => {
    let res: IIdentity[] = [];
    if (!data || !data.value || !Array.isArray(data.value)) {
        return res;
    }
    data.value.map((item: any) => {
        const singleIdentity: IIdentity = {
            entityId: `vss.ds.v1.aad.user.${item?.properties['http://schemas.microsoft.com/identity/claims/objectidentifier'].$value}`,
            entityType: "User",
            originDirectory: "aad",
            originId: item?.properties['http://schemas.microsoft.com/identity/claims/objectidentifier'].$value,
            displayName: item?.providerDisplayName,
            mail: item?.properties['Mail']?.$value,
            image: `https://dev.azure.com/WWLOpsTest/_apis/GraphProfile/MemberAvatars/${item?.subjectDescriptor}?size=0`,
            telephoneNumber: '123123'
        };
        res.push(singleIdentity);
    });
    return res;
}


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

//Get all user in org
//https://vssps.dev.azure.com/WWLOpsTest/_apis/graph/users?api-version=7.2-preview.1

export const getOrgUsers = async (orgName:string): Promise<any> => {
    const api = `https://vssps.dev.azure.com/${orgName}/_apis/graph/users?api-version=7.2-preview.1`;
    const res = await fetch(api, {
        method: 'GET',
    });
    if (!res.ok) {
        throw new Error(`Error occured when get org's users error: ${res.statusText}`);
    }
    return await res.json();
};

const getIdentities=async (inputStr:string)=>{
    const orgUsers= await getOrgUsers('WWLOpsTest');
    const identities=orgUsers.value as IIdentityProps[];

    const filteredIdentities = identities.filter(identity => 
        identity.displayName.toLowerCase().includes(inputStr.toLowerCase()) ||
        identity.directoryAlias.toLowerCase().includes(inputStr.toLowerCase()) ||
        identity.mailAddress.toLowerCase().includes(inputStr.toLowerCase())
    );
    
    const result: IIdentity[] = filteredIdentities.map(identity => ({
        entityId: identity.displayName,
        entityType: identity.subjectKind,
        originDirectory: identity.origin,
        originId: identity.originId,
        displayName: identity.displayName,
        mail: identity.mailAddress
    }));
    return result;
}


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
