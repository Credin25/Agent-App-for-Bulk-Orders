import { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InsuranceOptions from "../screens/Insurance/InsurancePlans";
import InsuranceMain from "../screens/Insurance/InsuranceMain";
import { useNavigationState } from "@react-navigation/native";
import NomineeForm from "../screens/Insurance/NomineeForm";

const InsuranceStack = () => {
    const Stack = createNativeStackNavigator<any>();
    const activeRouteName = useNavigationState((state) => {
        const route = state.routes[state.index];
        return route.name;
    });

    useEffect(() => {
    }, [activeRouteName]);

    return (
        <Stack.Navigator>

            <Stack.Screen
                component={InsuranceOptions}
                name="InsuranceOptions"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                component={InsuranceMain}
                name="InsuranceMain"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                component={NomineeForm}
                name="NomineeForm"
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default InsuranceStack;