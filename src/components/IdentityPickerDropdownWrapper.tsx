import { ObservableValue } from "azure-devops-ui/Core/Observable";
import {
    IdentityPickerDropdown,
    IIdentity,
} from "azure-devops-ui/IdentityPicker";
import * as React from "react";
import { IdentityPickerProvider } from "./IdentityPickerProvider";
import { getIdentities } from "../api/IdentityTest";

export const IdentityPickerDropdownWrapper: React.FC<{
    onChange?: (identity?: IIdentity) => void;
}> = ({ onChange }) => {
    const value = React.useMemo(() => new ObservableValue<IIdentity | undefined>(undefined), []);
    const [pickerProvider, setPickerProvider] = React.useState<IdentityPickerProvider | null>(null);

    React.useEffect(() => {
        const fetchIdentities = async () => {
            
            const identities = await getIdentities("", "WWLOpsTest");
            const provider = new IdentityPickerProvider("WWLOpsTest");
            provider.setPersonas(identities);
            provider.loadRecentIdentities(); // 从 localStorage 加载
            setPickerProvider(provider);
        };
        fetchIdentities();
    }, []);

    const handleChange = (identity?: IIdentity) => {
        value.value = identity;
        if (identity && pickerProvider) {
            pickerProvider.addRecentIdentity(identity);
        }
        onChange?.(identity);
    };

    return pickerProvider ? (
        <IdentityPickerDropdown
            onChange={handleChange}
            pickerProvider={pickerProvider}
            value={value}
        />
    ) : null;
};
