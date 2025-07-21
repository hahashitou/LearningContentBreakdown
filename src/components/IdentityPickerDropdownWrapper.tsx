import { ObservableValue } from "azure-devops-ui/Core/Observable";
import {
    IdentityPickerDropdown,
    IIdentity,
} from "azure-devops-ui/IdentityPicker";
import * as React from "react";
import { IdentityPickerProvider } from "./IdentityPickerProvider";
import { getIdentities } from "../api/Identity";
import { useIdentityCache } from "../api/identityCache";

export const IdentityPickerDropdownWrapper: React.FC<{
    onChange?: (identity?: IIdentity) => void;
}> = ({ onChange }) => {
    const value = React.useMemo(() => new ObservableValue<IIdentity | undefined>(undefined), []);
   // const [pickerProvider, setPickerProvider] = React.useState<IdentityPickerProvider | null>(null);
     const { provider, loading, error } = useIdentityCache('WWLOpsTest');

    const handleChange = (identity?: IIdentity) => {
        value.value = identity;
        if (identity && provider) {
            provider.addRecentIdentity(identity);
        }
        onChange?.(identity);
    };
    if (loading) {
        return <div style={{ padding: '8px', textAlign: 'center' }}>Loading...</div>;
    }

    if (error) {
        console.error('Identity picker error:', error);
        return <div style={{ padding: '8px', color: 'red' }}>Error loading identities</div>;
    }

    // React.useEffect(() => {
    //     const fetchIdentities = async () => {
            
    //         const identities = await getIdentities("WWLOpsTest");//获取org下的所有身份信息
    //         const provider = new IdentityPickerProvider("WWLOpsTest");
    //         provider.setPersonas(identities);
    //         provider.loadRecentIdentities(); // 从 localStorage 加载
    //         setPickerProvider(provider);
    //     };
    //     fetchIdentities();
    // }, []);

 

    return provider ? (
        <IdentityPickerDropdown
            onChange={handleChange}
            pickerProvider={provider}
            value={value}
        />
    ) : null;
};
