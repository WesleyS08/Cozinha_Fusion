import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Animated, ScrollView, Button } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Dimensions } from 'react-native';
import * as Yup from 'yup';
import { login } from '../DBA/authService';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');
const isPortrait = height > width;

type LoginScreenProps = {
    navigation: StackNavigationProp<any>;
};

const schema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    senha: Yup.string().required('Senha é obrigatória'),
});

export default function Login({ navigation }: LoginScreenProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const { control, handleSubmit, formState: { errors }, setValue } = useForm({
        resolver: yupResolver(schema),
    });
    const floatAnimation1 = useRef(new Animated.Value(0)).current;
    const floatAnimation2 = useRef(new Animated.Value(0)).current;
    const floatAnimation3 = useRef(new Animated.Value(0)).current;
    const floatAnimation4 = useRef(new Animated.Value(0)).current;
    const translateY1 = floatAnimation1.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -10],
    });

    const translateY2 = floatAnimation2.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -15],
    });

    const translateY3 = floatAnimation3.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -20],
    });

    const translateY4 = floatAnimation4.interpolate({
        inputRange: [0, 1],
        outputRange: [0, -25],
    });

    const startFloatingAnimation = (animation: Animated.Value) => {
        animation.setValue(0);
        Animated.loop(
            Animated.sequence([
                Animated.timing(animation, {
                    toValue: 1,
                    duration: 2000,
                    useNativeDriver: true,
                }),
                Animated.timing(animation, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    useEffect(() => {
        startFloatingAnimation(floatAnimation1);
        startFloatingAnimation(floatAnimation2);
        startFloatingAnimation(floatAnimation3);
        startFloatingAnimation(floatAnimation4);
    }, []);

    useEffect(() => {
        const loadRememberedCredentials = async () => {
            const savedIdentifier = await AsyncStorage.getItem('rememberedIdentifier');
            const savedPassword = await AsyncStorage.getItem('rememberedPassword');
            if (savedIdentifier) {
                setValue('nome', savedIdentifier);
                setRememberMe(true);
            }
            if (savedPassword) {
                setValue('senha', savedPassword);
            }
        };
        loadRememberedCredentials();
    }, [setValue]);

    const handleLogin = async (data: any) => {
        const { nome, senha } = data;
        const { user, session, error } = await login(nome, senha);

        console.log({ user, session, error });

        if (error) {
            setErrorMessage(error.message || "Erro ao fazer login");
            setSuccessMessage('');
        } else {
            setSuccessMessage('Login realizado com sucesso!');
            setErrorMessage('');
            navigation.replace('Main');

            if (rememberMe) {
                await AsyncStorage.setItem('rememberedIdentifier', nome);
                await AsyncStorage.setItem('rememberedPassword', senha); 
            } else {
                await AsyncStorage.removeItem('rememberedIdentifier');
                await AsyncStorage.removeItem('rememberedPassword'); 
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container}>
            {/* Imagens de fundo */}
            <Animated.Image
                source={require('../../assets/img/salada.png')}
                style={[styles.image, { transform: [{ translateY: translateY1 }], top: 50, left: 20 }]}
            />
            <Animated.Image
                source={require('../../assets/img/frango.png')}
                style={[styles.image, { transform: [{ translateY: translateY2 }], top: 100, right: 20 }]}
            />
            <Animated.Image
                source={require('../../assets/img/hamburguer.png')}
                style={[styles.image, { transform: [{ translateY: translateY3 }], bottom: 50, left: 20 }]}
            />
            <Animated.Image
                source={require('../../assets/img/pizza.png')}
                style={[styles.image, { transform: [{ translateY: translateY4 }], bottom: 100, right: 20 }]}
            />

            <Image
                source={{ uri: 'https://ijeivghnlfloednblebo.supabase.co/storage/v1/object/sign/InfosAPP/icon.png?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1cmwiOiJJbmZvc0FQUC9pY29uLnBuZyIsImlhdCI6MTczMDQ2MjkwMiwiZXhwIjoyNjc2NTQyOTAyfQ.1sxgyRQwFtYMh9y3hNARvJ_5PMsnYEo-NSePLDXX7zg&t=2024-11-01T12%3A08%3A24.927Z' }}
                style={styles.logo}
            />
            <Text style={styles.title}>Acesse sua conta na Comunidade Cozinha Fusion</Text>

            {errorMessage && (
                <View style={styles.messageContainer}>
                    <Text style={styles.errorMessage}>{errorMessage}</Text>
                </View>
            )}
            {successMessage && (
                <View style={styles.messageContainer}>
                    <Text style={styles.successMessage}>{successMessage}</Text>
                </View>
            )}

            <Controller
                control={control}
                name="nome"
                render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                        style={styles.input}
                        placeholder="Nome ou email do Chef"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                    />
                )}
            />
            {errors.nome && <Text style={styles.error}>{errors.nome.message}</Text>}

            <Controller
                control={control}
                name="senha"
                render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ position: 'relative' }}>
                        <TextInput
                            style={styles.input}
                            placeholder="Senha"
                            secureTextEntry={!showPassword}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            returnKeyType="next"
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Icon name={showPassword ? "eye-off" : "eye"} size={20} color="#FF6F00" />
                        </TouchableOpacity>
                        {errors.senha && <Text style={styles.error}>{errors.senha.message}</Text>}
                    </View>
                )}
            />
            {/* Lembre-se de mim */}
            <View style={styles.rememberContainer}>
                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
                    <Icon name={rememberMe ? "checkbox-outline" : "square-outline"} size={24} color="#FF6F00" />
                </TouchableOpacity>
                <Text style={styles.rememberText}>Lembre-se de mim</Text>
            </View>

            <View>
                <Button title="Entrar" onPress={handleSubmit(handleLogin)} />
                <Button title="Ir para Cadastro" onPress={() => navigation.navigate('Cadastro')} />
                <Button title="Esqueceu a senha?" onPress={() => navigation.navigate('EsqueceuSenha')} />
            </View>
        </ScrollView>
    );
}
const styles = StyleSheet.create({
    container:
    {
        padding: 20,
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: '#FFF8E1',
    },
    logo:
    {
        width: 150,
        height: 150,
        alignSelf: 'center',
        marginTop: isPortrait ? 0 : '5%',
        marginBottom: 20,
        resizeMode: 'contain',
        borderRadius: 44,
    },
    title:
    {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        color: '#FF6F00',
        fontWeight: 'bold',
    },
    input:
    {
        width: '100%',
        borderWidth: 1,
        borderColor: '#FFB74D',
        padding: 12,
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
    },
    messageContainer:
    {
        marginBottom: 15,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    errorMessage:
    {
        color: '#D32F2F',
        textAlign: 'center',
        fontSize: 16,
    },
    successMessage:
    {
        color: '#388E3C',
        textAlign: 'center',
        fontSize: 16,
    },
    image:
    {
        width: 100,
        height: 100,
        position: 'absolute',
        resizeMode: 'contain',
    },

    eyeButton:
    {
        position: 'absolute',
        right: 10,
        top: 18,
    },
    rememberContainer:
    {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    rememberText:
    {
        fontSize: 16,
        color: '#333',
        marginLeft: 8,
        fontFamily: 'Arial',
    },
    error:
    {
        fontSize: 16,
        color: 'red',
        marginBottom: 10,
    },
});