import { useState, useEffect, useRef } from 'react';
import { IIdentity } from "azure-devops-ui/IdentityPicker";
import { getIdentities } from "../api/Identity";
import { IdentityPickerProvider } from "../components/IdentityPickerProvider";

interface IdentityCacheState {
    identities: IIdentity[] | null;
    provider: IdentityPickerProvider | null;
    loading: boolean;
    error: string | null;
}

class IdentityCache {
    private cache: Map<string, IdentityCacheState> = new Map();
    private promises: Map<string, Promise<IdentityCacheState>> = new Map();

    async getIdentityProvider(orgName: string): Promise<IdentityCacheState> {
        // 如果缓存中已有数据，直接返回
        if (this.cache.has(orgName)) {
            return this.cache.get(orgName)!;
        }

        // 如果正在请求中，返回现有的 Promise
        if (this.promises.has(orgName)) {
            return this.promises.get(orgName)!;
        }

        // 创建新的请求
        const promise = this.fetchIdentityProvider(orgName);
        this.promises.set(orgName, promise);

        try {
            const result = await promise;
            this.cache.set(orgName, result);
            return result;
        } finally {
            this.promises.delete(orgName);
        }
    }

    private async fetchIdentityProvider(orgName: string): Promise<IdentityCacheState> {
        try {
            const identities = await getIdentities(orgName);
            const provider = new IdentityPickerProvider(orgName);
            provider.setPersonas(identities);
            provider.loadRecentIdentities();

            return {
                identities,
                provider,
                loading: false,
                error: null
            };
        } catch (error) {
            return {
                identities: null,
                provider: null,
                loading: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }

    clearCache(orgName?: string) {
        if (orgName) {
            this.cache.delete(orgName);
        } else {
            this.cache.clear();
        }
    }
}

const globalIdentityCache = new IdentityCache();

export const useIdentityCache = (orgName: string) => {
    const [state, setState] = useState<IdentityCacheState>({
        identities: null,
        provider: null,
        loading: true,
        error: null
    });

    useEffect(() => {
        let isMounted = true;

        const loadData = async () => {
            try {
                const result = await globalIdentityCache.getIdentityProvider(orgName);
                if (isMounted) {
                    setState(result);
                }
            } catch (error) {
                if (isMounted) {
                    setState({
                        identities: null,
                        provider: null,
                        loading: false,
                        error: error instanceof Error ? error.message : 'Unknown error'
                    });
                }
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [orgName]);

    return state;
};

export { globalIdentityCache };