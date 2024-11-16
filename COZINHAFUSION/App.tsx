import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './src/navigation/AuthStack';
import './i18n';

export default function App() {
    return (
        <NavigationContainer>
            <AuthStack />
        </NavigationContainer>
    );
}
