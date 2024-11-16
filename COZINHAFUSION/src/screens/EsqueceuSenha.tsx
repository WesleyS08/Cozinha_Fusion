import React from 'react';
import { View, Text, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';

type EsqueceuSenhaScreenProps = {
    navigation: StackNavigationProp<any>;
};

export default function EsqueceuSenha({ navigation }: EsqueceuSenhaScreenProps) {
    return (
        <View>
            <Text>Esqueceu a Senha Screen</Text>
            <Button title="Voltar para Login" onPress={() => navigation.navigate('Login')} />
        </View>
    );
}
