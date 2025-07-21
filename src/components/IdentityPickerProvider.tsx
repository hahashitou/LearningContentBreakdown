import {
    IIdentity,
    IPeoplePickerProvider,
    IPersonaConnections,
} from "azure-devops-ui/IdentityPicker";

export class IdentityPickerProvider implements IPeoplePickerProvider {
    private orgName: string;
    private personas: IIdentity[] = [];
    private bosses: IIdentity[] = [
    ];
    private allEmployees: IIdentity[] = [];
    private currentPersonas: IIdentity[] = [];
    private recentIdentities: IIdentity[] = [];

    constructor(orgName: string) {
        this.orgName = orgName;
    }

    public setPersonas(personas: IIdentity[]) {
        this.personas = personas;
        this.allEmployees = this.personas.concat(this.bosses);
    }

    public addRecentIdentity(identity: IIdentity) {
        this.recentIdentities = this.recentIdentities.filter(x => x.entityId !== identity.entityId);
        this.recentIdentities.unshift(identity);
        if (this.recentIdentities.length > 5) {
            this.recentIdentities.pop();
        }
        this.saveRecentIdentities();
    }

    public loadRecentIdentities() {
        const key = `recentIdentities_${this.orgName}`;
        const stored = localStorage.getItem(key);
        console.debug('Loading recent identities from localStorage:', stored);
        if (stored) {
            try {
                const parsed = JSON.parse(stored) as IIdentity[];
                this.recentIdentities = parsed;
            } catch {
                this.recentIdentities = [];
            }
        }
    }

    private saveRecentIdentities() {
        try {
            const key = `recentIdentities_${this.orgName}`;
            localStorage.setItem(key, JSON.stringify(this.recentIdentities));
            console.debug('Saved recent identities to localStorage:', this.recentIdentities);
        } catch (error) {
            console.warn("保存 recent identities 失败:", error);
        }
    }

    public onFilterIdentities(filter: string, selectedItems?: IIdentity[]) {
        return this.getPersonaList(filter, selectedItems);
    }

    public getEntityFromUniqueAttribute(entityId: string): IIdentity {
        return this.allEmployees.filter(x => x.entityId === entityId)[0];
    }

    public onRequestConnectionInformation(entity: IIdentity, getDirectReports?: boolean): IPersonaConnections {
        return {
            directReports: getDirectReports ? this.personas : undefined,
            managers: this.bosses,
        };
    }

    public onEmptyInputFocus(): IIdentity[] {
        return this.recentIdentities.length > 0
            ? this.recentIdentities
            : this.personas.slice(0, 3);
    }

    private getPersonaList(
        filter: string,
        selectedItems?: IIdentity[]
    ): Promise<IIdentity[]> | IIdentity[] {
        if (this.currentPersonas.length > 0) {
            return this.filterList(filter, selectedItems);
        } else {
            return new Promise<IIdentity[]>((resolve, reject) => {
                this.currentPersonas = this.personas;
                resolve(this.filterList(filter, selectedItems));
            });
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
