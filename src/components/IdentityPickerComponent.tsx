import { IdentityPicker, IIdentity, IPeoplePickerProvider, IPersonaConnections } from 'azure-devops-ui/IdentityPicker';
import * as React from 'react';
import * as SDK from 'azure-devops-extension-sdk';
import { convertRecentlyPeoplesToIdentities, getRecentlyPeoples } from '../api/Identity';
import { IWorkItemFormService } from "azure-devops-extension-api/WorkItemTracking";

export const IdentityPickerComponent = () => {
  React.useEffect(() => {
    SDK.register(SDK.getContributionId(), {});
  });
  const pickerProvider = React.useMemo(() => new IdentityPickerProviderExample(), []);

  const onIdentitiesRemoved = (identities: IIdentity[]) => {
    console.log('Identities removed:', identities);
  };

  const onIdentityAdded = (identity: IIdentity) => {
    console.log('Identity added:', identity);
  };

  const onIdentityRemoved = (identity: IIdentity) => {
    console.log('Identity removed:', identity);
  };
  const aa = async () => {
    const workItemService = await SDK.getService<IWorkItemFormService>("ms.vss-work-web.work-item-form-service");
    workItemService.setError("IdentityPickerComponent");
    workItemService.clearError();
  }
  return (
    <div style={{ height: '400px' }}>
      <IdentityPicker
        onIdentitiesRemoved={onIdentitiesRemoved}
        onIdentityAdded={onIdentityAdded}
        onIdentityRemoved={onIdentityRemoved}
        pickerProvider={pickerProvider}
        selectedIdentities={[]} /></div>
  );
}

export class IdentityPickerProviderExample implements IPeoplePickerProvider {
  constructor() {
    this.initPersonas();
  }
  async initPersonas() {
    try {
      const data = await getRecentlyPeoples();
      const res = convertRecentlyPeoplesToIdentities(data);
      console.debug('Fetched recently peoples:', data);
      this.personas = this.personas.concat(res);
    } catch (error) {
      console.error('Failed to fetch recently peoples:', error);
    }
  }
  private currentPersonas: IIdentity[] = [];

  private bosses: IIdentity[] = [
  ];

  private personas: IIdentity[] = [
  ];

  private allEmployees: IIdentity[] = this.personas.concat(this.bosses);

  public onFilterIdentities(filter: string, selectedItems?: IIdentity[]) {
    return this.getPersonaList(filter, selectedItems);
  }

  public getEntityFromUniqueAttribute = (entityId: string): IIdentity => {
    return this.allEmployees.filter((x) => x.entityId === entityId)[0];
  };

  public onRequestConnectionInformation = (
    entity: IIdentity,
    getDirectReports?: boolean
  ): IPersonaConnections => {
    return {
      directReports: getDirectReports ? this.personas : undefined,
      managers: this.bosses,
    };
  };

  public onEmptyInputFocus(): IIdentity[] {
    return this.personas;
  }

  private getPersonaList(
    filter: string,
    selectedItems?: IIdentity[]
  ): Promise<IIdentity[]> | IIdentity[] {
    if (this.currentPersonas.length > 0) {
      return this.filterList(filter, selectedItems);
    } else {
      return new Promise<IIdentity[]>((resolve) =>
        setTimeout(() => {
          this.currentPersonas = this.personas;
          resolve(this.filterList(filter, selectedItems));
        }, 800)
      );
    }
  }

  private filterList(filter: string, selectedItems?: IIdentity[]) {
    if (filter === "") {
      return this.onEmptyInputFocus();
    }
    return this.currentPersonas.filter(
      (x) =>
        (selectedItems === undefined || selectedItems.indexOf(x) === -1) &&
        ((x.displayName &&
          x.displayName.toLowerCase().indexOf(filter.toLowerCase()) !== -1) ||
          (x.mail && x.mail.toLowerCase().indexOf(filter.toLowerCase()) !== -1))
    );
  }
}