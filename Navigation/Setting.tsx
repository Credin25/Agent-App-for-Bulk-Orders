import { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNavigationState } from "@react-navigation/native";
import SettingsScreen from "../screens/SettingsScreen";
import OrderScreen from "../screens/OrdersScreen";
const SettingsStack = () => {
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
                component={SettingsScreen}
                name="SettingsMain"
                options={{ headerShown: false }}
            />
            <Stack.Screen
                component={OrderScreen}
                name="Orders"
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    );
};

export default SettingsStack;