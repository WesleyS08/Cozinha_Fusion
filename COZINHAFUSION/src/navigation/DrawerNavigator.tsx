import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Favoritos from '../screens/Favoritos';
import Home from '../screens/Home';
import BuscarReceitas from '../screens/BuscarReceitas';
import AdicionarReceita from '../screens/AdicionarReceita';
import { Feather } from '@expo/vector-icons';
import Perfil from '../screens/Perfil ';

export type DrawerParamList = {
    Home: undefined;
    Favoritos: undefined;
    Perfil: undefined;
    BuscarReceitas: undefined;
    AdicionarReceita: undefined;
};

// Criação do Drawer Navigator
const Drawer = createDrawerNavigator<DrawerParamList>();

export default function DrawerNavigator() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer.Navigator
                initialRouteName="Home"
                screenOptions={{
                    headerShown: false,
                    drawerActiveBackgroundColor: 'transparent',
                    drawerInactiveBackgroundColor: 'transparent',
                    drawerActiveTintColor: '#ffffff',
                    drawerInactiveTintColor: '#727d9b',
                    drawerHideStatusBarOnOpen: true,
                    overlayColor: 'transparent',
                    drawerStyle: {
                        backgroundColor: '#1d1f25',
                        paddingTop: 32,
                        width: '50%',
                    },
                    drawerLabelStyle: {
                        marginLeft: 1, 
                        paddingLeft: 10,
                    },
                    sceneContainerStyle: {
                        backgroundColor: '#1d1f25',
                    },
                }}
            >
                <Drawer.Screen
                    name="Home"
                    component={Home}
                    options={{
                        drawerLabel: 'Explorar',
                        drawerIcon: ({ color }) => <Feather name="home" size={20} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="Favoritos"
                    component={Favoritos}
                    options={{
                        drawerLabel: 'Favoritos',
                        drawerIcon: ({ color }) => <Feather name="heart" size={20} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="BuscarReceitas"
                    component={BuscarReceitas}
                    options={{
                        drawerLabel: 'Buscar Receitas',
                        drawerIcon: ({ color }) => <Feather name="search" size={20} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="AdicionarReceita"
                    component={AdicionarReceita}
                    options={{
                        drawerLabel: 'Adicionar Receita',
                        drawerIcon: ({ color }) => <Feather name="plus-circle" size={20} color={color} />,
                    }}
                />
                <Drawer.Screen
                    name="Perfil"
                    component={Perfil}
                    options={{
                        drawerLabel: 'Perfil',
                        drawerIcon: ({ color }) => <Feather name="user" size={20} color={color} />,
                    }}
                />
            </Drawer.Navigator>
        </GestureHandlerRootView>
    );
}
