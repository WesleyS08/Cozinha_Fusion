import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image, Animated, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { register } from '../DBA/authService';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Dimensions } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';



type CadastroScreenProps = {
    navigation: StackNavigationProp<any>;
};


const { width, height } = Dimensions.get('window');
const isPortrait = height > width;

const schema = Yup.object().shape({
    nome: Yup.string().required('Nome é obrigatório'),
    email: Yup.string().email('Email inválido').required('Email é obrigatório'),
    senha: Yup.string()
        .min(6, 'A senha deve ter no mínimo 6 caracteres')
        .matches(/[a-zA-Z]/, 'A senha deve conter pelo menos uma letra')
        .matches(/[0-9]/, 'A senha deve conter pelo menos um número')
        .required('Senha é obrigatória'),
    confirmarSenha: Yup.string()
        .oneOf([Yup.ref('senha')], 'As senhas devem ser iguais')
        .required('Confirmação de senha é obrigatória'),
});

export default function CadastroScreen({ navigation }: CadastroScreenProps){
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const { control, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: yupResolver(schema),
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const floatAnimation1 = new Animated.Value(0);
    const floatAnimation2 = new Animated.Value(0);
    const floatAnimation3 = new Animated.Value(0);
    const floatAnimation4 = new Animated.Value(0);

    const startFloatingAnimation = (animation: any) => {
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

    const emailRef = useRef(null);
    const senhaRef = useRef(null);
    const confirmarSenhaRef = useRef(null);

    const onSubmit = async (data: any) => {
        try {
            setLoading(true);
            setErrorMessage('');
            setSuccessMessage('');

            const { user, error } = await register(data.nome, data.email, data.senha);

            if (error) {
                setErrorMessage(error.message);
                console.error('Erro ao cadastrar:', error.message);
            } else {
                setSuccessMessage('Bem-vindo ao Cozinha Fusion! Seu perfil de chef está pronto.');
                console.log('Cadastro realizado com sucesso:', user);
                navigation.replace('Main');
                reset();
            }
        } catch (error) {
            setErrorMessage('Ops! Algo deu errado na nossa cozinha digital. Tente novamente.');
            console.error('Erro:', error);
        } finally {
            setLoading(false);
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
            <Text style={styles.title}>Junte-se à Comunidade Cozinha Fusion</Text>

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
                    <View style={styles.inputContainer}>
                        <Icon name="chef-hat" size={20} color="#FF6F00" style={styles.icon} />
                        <TextInput
                            style={styles.input}
                            placeholder="Nome do Chef"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            returnKeyType="next"
                            onSubmitEditing={() => emailRef.current.focus()}
                        />
                        {errors.nome && <Text style={styles.error}>{errors.nome.message}</Text>}
                    </View>
                )}
            />

            <Controller
                control={control}
                name="email"
                render={({ field: { onChange, onBlur, value } }) => (
                    <View>
                        <TextInput
                            ref={emailRef}
                            style={styles.input}
                            placeholder="Email"
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            keyboardType="email-address"
                            returnKeyType="next"
                            onSubmitEditing={() => senhaRef.current.focus()}
                        />
                        {errors.email && <Text style={styles.error}>{errors.email.message}</Text>}
                    </View>
                )}
            />

            <Controller
                control={control}
                name="senha"
                render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ position: 'relative' }}>
                        <TextInput
                            ref={senhaRef}
                            style={styles.input}
                            placeholder="Senha"
                            secureTextEntry={!showPassword}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            returnKeyType="next"
                            onSubmitEditing={() => confirmarSenhaRef.current.focus()}
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

            <Controller
                control={control}
                name="confirmarSenha"
                render={({ field: { onChange, onBlur, value } }) => (
                    <View style={{ position: 'relative' }}>
                        <TextInput
                            ref={confirmarSenhaRef}
                            style={styles.input}
                            placeholder="Confirme a Senha"
                            secureTextEntry={!showConfirmPassword}
                            onBlur={onBlur}
                            onChangeText={onChange}
                            value={value}
                            returnKeyType="done"
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Icon name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#FF6F00" />
                        </TouchableOpacity>
                        {errors.confirmarSenha && <Text style={styles.error}>{errors.confirmarSenha.message}</Text>}
                    </View>
                )}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit(onSubmit)}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#ffffff" />
                ) : (
                    <Text style={styles.buttonText}>Criar Conta</Text>
                )}
            </TouchableOpacity>
            <Text style={styles.termsText}>
                Ao se cadastrar, você concorda com nossos Termos de Serviço e Política de Privacidade.
            </Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
        justifyContent: 'center',
        backgroundColor: '#FFF8E1',

    },
    logo: {
        width: 150,
        height: 150,
        alignSelf: 'center',
        marginTop: isPortrait ? 0 : '5%',
        marginBottom: 20,
        resizeMode: 'contain',
        borderRadius: 44,
    },
    title: {
        fontSize: 24,
        marginBottom: 20,
        textAlign: 'center',
        color: '#FF6F00',
        fontWeight: 'bold',
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#FFB74D',
        padding: 12,
        marginBottom: 15,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
        fontSize: 16,
    },
    error: {
        color: '#D32F2F',
        fontSize: 14,
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#FF6F00',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    messageContainer: {
        marginBottom: 15,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    errorMessage: {
        color: '#D32F2F',
        textAlign: 'center',
        fontSize: 16,
    },
    successMessage: {
        color: '#388E3C',
        textAlign: 'center',
        fontSize: 16,
    },
    termsText: {
        fontSize: 12,
        color: '#666666',
        textAlign: 'center',
        marginTop: 20,
    },
    image: {
        width: 100,
        height: 100,
        position: 'absolute',
        resizeMode: 'contain',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        maxWidth: '90%'
    },
    icon: {
        padding: 10,
    },
    eyeButton: {
        position: 'absolute',
        right: 10,
        top: 18,
    },
});