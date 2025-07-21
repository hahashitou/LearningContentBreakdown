import * as SDK from 'azure-devops-extension-sdk'
import { IWorkItemFormService } from 'azure-devops-extension-api/WorkItemTracking';

export interface IJsonPatchDocument {
    op: string;
    path: string;
    from: string | null;
    value: string | IRelationSettings;
}

export interface IRelationSettings {
    rel: string;
    url: string;
    attributes?: {
      comment: string;
    };
}

let WorkItemFormService: IWorkItemFormService | null = null;

export const setFieldValue = async (fieldReferenceName: string, value: any): Promise<boolean> => {
    if (!fieldReferenceName || !value) {
        return false;
    }
    console.debug(`Setting field value for ${fieldReferenceName}:`, value);
    const workItemFormService = await getWorkItemFormService();
    if (!workItemFormService) {
        return false;
    }
    return await workItemFormService.setFieldValue(fieldReferenceName, value);
}

export const getFieldValue = async (fieldReferenceName: string) => {
    if (!fieldReferenceName) {
        return null;
    }
    const workItemFormService = await getWorkItemFormService();
   
    if (!workItemFormService) {
        return null;
    }
     console.debug(`Getting field value for workItemFormService`);
    return await workItemFormService.getFieldValues([fieldReferenceName]);
}

export const saveWorkItem = async () => {
  const workItemFormService = await getWorkItemFormService();
  await workItemFormService.save();
}

export const refreshWorkItem = async () => {
  const workItemFormService = await getWorkItemFormService();
  await workItemFormService.refresh();
}

const getWorkItemFormService = async () => {
    if (WorkItemFormService) {
        return WorkItemFormService;
    }
    console.debug('Initializing WorkItemFormService');
    WorkItemFormService = await SDK.getService<IWorkItemFormService>('ms.vss-work-web.work-item-form');
    return WorkItemFormService;
}

export const orgnizeCreateWorkItemParams = async (
    org: string,
    project: string,
    workItemTitle: string,
    body: IJsonPatchDocument[]
) => {
  const assignedTo = await getFieldValue('System.AssignedTo');
  body.push(
    {
      op: 'add',
      path: '/fields/System.Title',
      from: null,
      value: workItemTitle
    },
    {
      op: 'add',
      path: '/fields/System.AssignedTo',
      from: null,
      value: assignedTo ? assignedTo['System.AssignedTo'].toString() : ''
    },
  );
  
  const parentId = await getFieldValue('System.Id');
  if (parentId) {
    const id = parentId['System.Id'].toString();
    const newbody = addParentChildRel(org, body, project, id);
    return newbody;
  }
  return body;
}

const addParentChildRel = (
    org: string,
    body: IJsonPatchDocument[],
    project: string,
    parentId?: string
) => {
    const baseUrl = `https://dev.azure.com/${org}`;
    const url = `${baseUrl}/${project}/_workitems/edit/${parentId}`;
  
    const relParent: IJsonPatchDocument = {
      op: 'add',
      path: '/relations/-',
      from: null,
      value: {
        rel: 'System.LinkTypes.Hierarchy-Reverse',
        url: url,
        attributes: {
          comment: 'Comment for the link'
        }
      }
    };
  
    body.push(relParent);
    return body;
};