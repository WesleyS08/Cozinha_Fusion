import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Switch, ActivityIndicator, KeyboardAvoidingView, Modal, Platform, SafeAreaView, ScrollView, StatusBar, TextInput, Image } from 'react-native';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/FontAwesome';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { DrawerScreneWrapper } from '../components/drawer-scene-wrapper';
import { Dimensions } from 'react-native';
import i18n from '../../i18n'
import { useTranslation } from 'react-i18next';
import { getUserInfo } from '../DBA/UserSearch';
import * as ImagePicker from 'expo-image-picker';
import { fetchImageAsBase64, handleImageUpload } from '../DBA/UserInsert';
import { Alert } from 'react-native';
import { BottomSheet, Button, ListItem } from '@rneui/themed';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Animated } from 'react-native';
import UserAvatar from 'react-native-user-avatar';
import supabase from '../DBA/supabaseClient';
import { StackNavigationProp } from '@react-navigation/stack';

const { width, height } = Dimensions.get('window');
const isPortrait = height > width;

type PerfilScreenProps = {
    navigation: StackNavigationProp<any>;
};

export default function Perfil({ navigation }: PerfilScreenProps) {

    const [notificacoesAtivas, setNotificacoesAtivas] = React.useState(true);
    const [modoEscuro, setModoEscuro] = React.useState(false);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [modalContent, setModalContent] = React.useState('');
    const [showNotification, setShowNotification] = React.useState(false);
    const [username, setUsername] = React.useState('');
    const [emailVerified, setEmailVerified] = React.useState(false);
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [passwordInput, setPasswordInput] = React.useState('');
    const [rememberChoice, setRememberChoice] = React.useState(false);
    const [showPasswordModal, setShowPasswordModal] = React.useState(false);
    const colorScheme = modoEscuro ? 'dark' : 'light';
    const [showIdiomas, setShowIdiomas] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState('Português');
    const { t } = useTranslation();
    const [userInfo, setUserInfo] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [profileImage, setProfileImage] = useState(null);
    const [animacao] = useState(new Animated.Value(0));



    useEffect(() => {
        const fetchUserInfo = async () => {
            const info = await getUserInfo();
            if (info) {
                setUserInfo(info);
                setProfileImage(info.imagem_perfil);
            }
        };

        fetchUserInfo();
    }, []);


    // Interpolação para a posição do círculo
    const circlePosition = animacao.interpolate({
        inputRange: [0, 1],
        outputRange: [-87, 88],
    });

    // Interpolação para a cor do switch
    const switchBackgroundColor = animacao.interpolate({
        inputRange: [0, 1],
        outputRange: ['#ddd', '#ff8c00'],
    });




    const toggleNotificacoes = () => {
        setNotificacoesAtivas(prevState => !prevState);
    };

    const toggleModoEscuro = () => {
        setModoEscuro(previousState => !previousState);

        Animated.timing(animacao, {
            toValue: modoEscuro ? 0 : 1, 
            duration: 300, 
            useNativeDriver: false,
        }).start();
    };

    const openModal = (content) => {
        setModalContent(content);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
    };

    const handleUpdateProfile = () => {
        // Implementar a lógica para atualizar o perfil
    };

    const handleChangePassword = () => {
        // Implementar a lógica para alterar a senha
    };

    const handleDelete = async () => {
        setShowPasswordModal(true);
        closeModal();
    };

    const handlePasswordSubmit = async () => {
        if (!userInfo?.email) {
            Alert.alert('Erro', 'Informações do usuário não carregadas corretamente.');
            return;
        }
    
        try {
            // Tenta autenticar o usuário novamente usando a senha fornecida
            const { data, error } = await supabase.auth.signInWithPassword({
                email: userInfo.email,
                password: passwordInput,
            });
    
            if (error) {
                Alert.alert('Senha incorreta!');
                return;
            }
    
            // Agora a variável `data` contém o usuário autenticado e a sessão, e o id está em data.user.id
            const { error: updateError } = await supabase
                .from('usuarios')
                .update({ Ativada: false })
                .eq('email', userInfo.email); 
    
            if (updateError) {
                console.log('Erro na atualização de Ativada:', updateError.message); 
                Alert.alert('Erro ao desativar conta', updateError.message);
                return;
            }
    
            // Agora busque os dados atualizados
            const { data: updatedData, error: fetchError } = await supabase
                .from('usuarios')
                .select('Ativada')
                .eq('email', userInfo.email) 
                .single(); 
    
            if (fetchError) {
                console.log('Erro ao buscar dados atualizados:', fetchError.message);
                Alert.alert('Erro ao verificar status da conta', fetchError.message);
                return;
            }
    
            if (updatedData?.Ativada === false) {
                closeModal();
                setShowPasswordModal(false);
                navigation.navigate('Login');
                Alert.alert('Conta desativada com sucesso!');
            } else {
                Alert.alert('Erro', 'Não foi possível desativar sua conta.');
            }
    
        } catch (error: any) {
            console.log('Erro ao verificar a senha:', error.message); 
            Alert.alert('Erro ao verificar a senha', error.message);
        }
    };
    
    
    
    const handleLogoff = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                console.error('Erro ao sair:', error.message);
            } else {
                console.log('Usuário deslogado com sucesso!');
                navigation.navigate('Login')
            }
        } catch (error) {
            console.error('Erro inesperado ao sair:', error.message);
        }
    };

    const selectLanguage = async (language) => {
        setSelectedLanguage(language);
        await i18n.changeLanguage(language);
        setShowIdiomas(false);
        setIsVisible(false);
    };


    const [isVisible, setIsVisible] = useState(false);
    const list = [
        { title: 'Português' },
        { title: 'Inglês' },
        { title: 'Espanhol' },
        {
            title: 'Cancel',
            containerStyle: { backgroundColor: 'red' },
            titleStyle: { color: 'white' },
            onPress: () => setIsVisible(false),
        },
    ];

    const IdiomasDisponiveis = [
        { label: t('Português'), code: 'pt' },
        { label: t('Inglês'), code: 'en' },
        { label: t('Espanhol'), code: 'es' }
    ];

    const pickImage = async () => {
        console.log('pickImage: Iniciando a seleção de imagem...');
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            console.log('pickImage: Permissão concedida:', permissionResult.granted);

            if (!permissionResult.granted) {
                console.log('pickImage: Permissão negada. Exibindo alerta...');
                Alert.alert("Permissão necessária", "É necessário permitir o acesso à galeria!");
                return;
            }

            console.log('pickImage: Lançando a biblioteca de imagens...');
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });
            console.log('pickImage: Resultado da seleção de imagem:', result);

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const imageUri = result.assets[0].uri;
                console.log('pickImage: Imagem selecionada. Convertendo para Base64...');
                setUploading(true);

                const base64Image = await fetchImageAsBase64(imageUri);
                if (base64Image) {
                    const mimeType = result.assets[0].mimeType || 'image/jpeg';
                    setProfileImage(`data:${mimeType};base64,${base64Image}`);
                    console.log('pickImage: Imagem convertida para Base64 com sucesso!');

                    if (userInfo) {
                        const userId = userInfo.id;
                        const imageUrl = await handleImageUpload(base64Image, userId);
                        if (imageUrl) {
                            const { error: updateError } = await supabase
                                .from('usuarios')
                                .update({ imagem_perfil: imageUrl })
                                .eq('id', userId);

                            if (updateError) {
                                console.error(`Erro ao atualizar imagem_perfil: ${updateError.message}`);
                            } else {
                                console.log('Imagem de perfil atualizada com sucesso no banco.');
                            }
                        } else {
                            Alert.alert("Erro", "Falha ao gerar URL da imagem.");
                        }
                    }
                } else {
                    Alert.alert("Erro", "Falha ao converter a imagem.");
                }
                setUploading(false);
            } else {
                console.log('pickImage: Seleção de imagem cancelada ou sem ativos.');
            }
        } catch (error) {
            console.error('Erro durante a seleção de imagem:', error);
            Alert.alert("Erro", "Ocorreu um erro durante a seleção de imagem.");
        }
    };


    return (
        <KeyboardAvoidingView
            style={[styles.container, colorScheme === 'dark' && { backgroundColor: '#1a1a1a' }]}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        >
            <DrawerScreneWrapper>
                <View style=
                    {[styles.containermenu, colorScheme === 'dark' && { backgroundColor: '#1a1a1a' }]}>
                    <View style={styles.header}>
                        <Text style=
                            {[styles.username, colorScheme === 'dark' && { color: '#fff' }]}>
                            {t("Perfil")}
                        </Text>
                        <DrawerToggleButton
                            tintColor={colorScheme === 'dark' ? '#fff' : '#000'}
                        />
                    </View>
                </View>
                <SafeAreaView style={[styles.container, colorScheme === 'dark' && { backgroundColor: '#212121' }]}>
                    <View style={[styles.containerOpcoes, colorScheme === 'dark' && { backgroundColor: '#000' }]}>
                        <TouchableOpacity style={styles.profileCircle} onPress={pickImage}>
                            {uploading ? (
                                <ActivityIndicator size="large" />
                            ) : profileImage ? (
                                <Image source={{ uri: profileImage }} style={styles.profileImage} />
                            ) : (
                                <UserAvatar size={70} name={userInfo?.name || 'User'} />
                            )}
                        </TouchableOpacity>
                        {userInfo ? (
                            <Text style={[styles.usernameText, colorScheme === 'dark' && { color: '#fff' }]}>
                                {userInfo.name || t("Carregando...")}
                            </Text>
                        ) : (
                            <Text style={[styles.usernameText, colorScheme === 'dark' && { color: '#fff' }]}>
                                {t("Carregando...")}
                            </Text>
                        )}

                        <ScrollView contentContainerStyle={[styles.containerScroll, colorScheme === 'dark' && { backgroundColor: '#000' }]}>
                            <View style={styles.line} />
                            <Text style={[styles.message, colorScheme === 'dark' && { color: '#fff' }]}>
                                {t("Configurações de Conta")}
                            </Text>

                            <TouchableOpacity style={[styles.Options, colorScheme === 'dark' && { backgroundColor: '#ff8c00' }]} onPress={() => openModal('Editar dados')}>
                                <Text style={[styles.text, colorScheme === 'dark' && { color: '#fff' }]}>
                                    {t("Editar dados")}
                                </Text>
                                <Icon name="chevron-right" size={20} color={colorScheme === 'dark' ? '#fff' : '#ff8c00'} style={styles.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.Options, colorScheme === 'dark' && { backgroundColor: '#ff8c00' }]} onPress={() => openModal('Alterar a senha')}>
                                <Text style={[styles.text, colorScheme === 'dark' && { color: '#fff' }]}>{t("Alterar a senha")}</Text>
                                <Icon name="chevron-right" size={20} color={colorScheme === 'dark' ? '#fff' : '#ff8c00'} style={styles.icon} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.Options, colorScheme === 'dark' && { backgroundColor: '#ff8c00' }]}
                                onPress={() => setIsVisible(true)}
                                accessibilityLabel={t("Alterar Idioma")}
                            >
                                <Text style={[styles.text, colorScheme === 'dark' && { color: '#fff' }]}>
                                    {t("Alterar Idioma")}
                                </Text>
                                <Icon name="chevron-right" size={20} color={colorScheme === 'dark' ? '#fff' : '#ff8c00'} style={styles.icon} />
                            </TouchableOpacity>

                            <SafeAreaProvider>
                                <BottomSheet modalProps={{}} isVisible={isVisible}>
                                    <View style={{ backgroundColor: '#f0f0f0', padding: 10 }}> {/* Fundo para o BottomSheet */}
                                        <ScrollView>
                                            {IdiomasDisponiveis.map(({ label, code }) => (
                                                <TouchableOpacity
                                                    key={code}
                                                    onPress={() => selectLanguage(code)}
                                                    style={[
                                                        styles.idiomaItem,
                                                        {
                                                            backgroundColor: selectedLanguage === code ? '#ff8c00' : '#fff',
                                                            padding: 15,
                                                            borderRadius: 5,
                                                            marginVertical: 5,
                                                        }
                                                    ]}
                                                >
                                                    <Text style={[styles.idiomaText, { color: selectedLanguage === code ? '#fff' : '#333' }]}>
                                                        {label}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                            <TouchableOpacity
                                                onPress={() => setIsVisible(false)}
                                                style={{ backgroundColor: 'red', padding: 10, borderRadius: 5, marginTop: 10 }}
                                            >
                                                <Text style={{ color: 'white' }}>{t('Cancelar')}</Text>
                                            </TouchableOpacity>
                                        </ScrollView>
                                    </View>
                                </BottomSheet>
                            </SafeAreaProvider>

                                <TouchableOpacity style={styles.switchContainer} onPress={toggleModoEscuro}>
                                    {/* Ícone para Modo Claro */}
                                    <Icon name="sun-o" size={24} color={modoEscuro ? '#aaa' : '#ff8c00'} />

                                    {/* Use Animated.View para o switch */}
                                    <Animated.View style={[styles.switch, { backgroundColor: switchBackgroundColor }]}>
                                        <Animated.View style={[styles.circle, { transform: [{ translateX: circlePosition }] }]} />
                                    </Animated.View>

                                    {/* Ícone para Modo Escuro */}
                                    <Icon name="moon-o" size={24} color={modoEscuro ? '#ff8c00' : '#aaa'} />
                                </TouchableOpacity>

                            <View style={styles.line} />
                            <Text style={[styles.message, colorScheme === 'dark' && { color: '#fff' }]}>
                                {t("Mais Opções")}
                            </Text>

                            <TouchableOpacity style={[styles.Options, colorScheme === 'dark' && { backgroundColor: '#ff8c00' }]} onPress={() => openModal('Sobre nós')}>
                                <Text style={[styles.text, colorScheme === 'dark' && { color: '#fff' }]}>
                                    {t("Sobre nós")}
                                </Text>
                                <Icon name="chevron-right" size={20} color={colorScheme === 'dark' ? '#fff' : '#ff8c00'} style={styles.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.Options, colorScheme === 'dark' && { backgroundColor: '#ff8c00' }]} onPress={() => openModal('Política de Privacidade')}>
                                <Text style={[styles.text, colorScheme === 'dark' && { color: '#fff' }]}>
                                    {t("Política de Privacidade")}
                                </Text>
                                <Icon name="chevron-right" size={20} color={colorScheme === 'dark' ? '#fff' : '#ff8c00'} style={styles.icon} />
                            </TouchableOpacity>

                            <View style={styles.line} />
                            <Text style={[styles.message, colorScheme === 'dark' && { color: '#fff' }]}>
                                {t("Opções Avançadas")}
                            </Text>

                            <TouchableOpacity style={[styles.Options, colorScheme === 'dark' && { backgroundColor: '#ff8c00' }]} onPress={async () => {
                                const choice = await AsyncStorage.getItem('rememberChoice');
                                const isRememberChoice = choice ? JSON.parse(choice) : false;

                                if (isRememberChoice) {
                                    handleLogoff(); // Desloga diretamente
                                } else {
                                    openModal('Sair do App'); // Abre o modal
                                }
                            }}>
                                <Text style={[styles.text, colorScheme === 'dark' && { color: '#fff' }]}>
                                    {t("Sair do App")}
                                </Text>
                                <Icon name="chevron-right" size={20} color={colorScheme === 'dark' ? '#fff' : '#ff8c00'} style={styles.icon} />
                            </TouchableOpacity>

                            <TouchableOpacity style={[styles.Options, colorScheme === 'dark' && { backgroundColor: '#ff8c00' }]} onPress={() => openModal('Deletar Conta')}>
                                <Text style={[styles.text, colorScheme === 'dark' && { color: '#fff' }]}>
                                    {t("Deletar Conta")}
                                </Text>
                                <Icon name="chevron-right" size={20} color={colorScheme === 'dark' ? '#fff' : '#ff8c00'} style={styles.icon} />
                            </TouchableOpacity>

                            {/* Modal */}
                            <Modal
                                animationType="slide"
                                transparent={true}
                                visible={modalVisible}
                                onRequestClose={closeModal}
                            >
                                {/* Background com efeito de Blur */}
                                <BlurView
                                    intensity={10} // Intensidade do Blur (de 0 a 100)
                                    tint="dark"
                                    style={styles.blurContainer}
                                    experimentalBlurMethod="dimezisBlurView"
                                >
                                    <View style={[styles.modalView, colorScheme === 'dark' && { backgroundColor: '#1a1a1a' }]}>
                                        {/* Botão de Fechar como um X Vermelho */}
                                        <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                                            <Text style={styles.closeButtonText}>✕</Text>
                                        </TouchableOpacity>

                                        {modalContent === 'Editar dados' && (
                                            <View
                                                style={{
                                                    padding: 20,
                                                    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#fff',
                                                    borderRadius: 10,
                                                    elevation: 5,
                                                    shadowColor: colorScheme === 'dark' ? '#000' : '#ccc',
                                                    shadowOpacity: 0.5,
                                                    shadowRadius: 10,
                                                }}
                                            >
                                                <Text style={{
                                                    fontSize: 18,
                                                    color: colorScheme === 'dark' ? '#fff' : '#000',
                                                }}>
                                                    Editar Dados do Perfil
                                                </Text>

                                                {/* Campo para nome de usuário */}
                                                <TextInput
                                                    style={{
                                                        borderWidth: 1,
                                                        borderColor: colorScheme === 'dark' ? '#fff' : 'gray',
                                                        marginTop: '5%',
                                                        marginBottom: '10%',
                                                        padding: 8,
                                                        color: colorScheme === 'dark' ? '#fff' : '#000',
                                                        backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#fff',
                                                    }}
                                                    placeholder="Nome de usuário"
                                                    placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#777'}
                                                    value={username}
                                                    onChangeText={setUsername}
                                                    editable={emailVerified}
                                                />

                                                {/* Campo para email */}
                                                <TextInput
                                                    style={{
                                                        borderWidth: 1,
                                                        borderColor: colorScheme === 'dark' ? '#fff' : 'gray',
                                                        marginBottom: '10%',
                                                        padding: 8,
                                                        color: colorScheme === 'dark' ? '#fff' : '#000',
                                                        backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#fff',
                                                    }}
                                                    placeholder="Email do usuário"
                                                    placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#777'}
                                                    value={username}
                                                    onChangeText={setUsername}
                                                    editable={emailVerified}
                                                />

                                                {!emailVerified && (
                                                    <Text style={{ color: 'red' }}>
                                                        Verifique seu e-mail antes de atualizar os dados.
                                                    </Text>
                                                )}

                                                {/* Botão Atualizar desabilitado se o e-mail não estiver verificado */}
                                                <TouchableOpacity
                                                    style={{ backgroundColor: '#ff8c00', padding: 10, marginTop: 10 }}
                                                    onPress={handleUpdateProfile}
                                                    disabled={!emailVerified}
                                                >
                                                    <Text style={{ color: 'white' }}>
                                                        {emailVerified ? 'Atualizar' : 'Email não verificado'}
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        {modalContent === 'Alterar a senha' && (
                                            <View
                                                style={{
                                                    backgroundColor: colorScheme === 'dark' ? '#1c1c1e' : '#fff', // Fundo do modal
                                                    padding: 20,
                                                    borderRadius: 10,
                                                }}
                                            >
                                                <Text
                                                    style={{
                                                        color: colorScheme === 'dark' ? '#fff' : '#000', // Cor do texto
                                                        fontSize: 18,
                                                        marginBottom: 20,
                                                    }}
                                                >
                                                    Alterar Senha
                                                </Text>

                                                <TextInput
                                                    style={{
                                                        borderWidth: 1,
                                                        borderColor: colorScheme === 'dark' ? '#fff' : 'gray', // Cor da borda
                                                        backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#fff', // Fundo do campo
                                                        color: colorScheme === 'dark' ? '#fff' : '#000', // Cor do texto no campo
                                                        padding: 10,
                                                        marginBottom: 15,
                                                    }}
                                                    placeholder="Senha Atual"
                                                    placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#777'} // Placeholder adaptado
                                                    secureTextEntry={true}
                                                    value={currentPassword}
                                                    onChangeText={setCurrentPassword}
                                                />

                                                < TextInput
                                                    style={{
                                                        borderWidth: 1,
                                                        borderColor: colorScheme === 'dark' ? '#fff' : 'gray', // Cor da borda
                                                        backgroundColor: colorScheme === 'dark' ? '#2c2c2e' : '#fff', // Fundo do campo
                                                        color: colorScheme === 'dark' ? '#fff' : '#000', // Cor do texto no campo
                                                        padding: 10,
                                                        marginBottom: 15,
                                                    }}
                                                    placeholder="Nova Senha"
                                                    placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#777'} // Placeholder adaptado
                                                    secureTextEntry={true}
                                                    value={newPassword}
                                                    onChangeText={setNewPassword}
                                                />

                                                <TouchableOpacity
                                                    style={{
                                                        backgroundColor: '#ff8c00', // Cor do botão
                                                        padding: 10,
                                                        borderRadius: 5,
                                                        alignItems: 'center',
                                                    }}
                                                    onPress={handleChangePassword}
                                                >
                                                    <Text
                                                        style={{
                                                            color: '#fff', // Cor do texto do botão
                                                            fontWeight: 'bold',
                                                        }}
                                                    >
                                                        Alterar Senha
                                                    </Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}

                                        {modalContent === 'Sobre nós' && (
                                            <View>
                                                <Text style={[styles.modalText, colorScheme === 'dark' && { color: '#fff' }]}>Sobre Nós</Text>
                                                <Text style={[styles.modalInfo, colorScheme === 'dark' && { color: '#fff' }]}>Lorem ipsum dolor, sit amet consectetur adipisicing elit. Omnis, temporibus. Repudiandae ipsam unde dolor tenetur. Dolorem ab cupiditate aliquid velit. Quas fuga dicta similique! Ducimus culpa nam similique. Rerum, aliquam.</Text>
                                            </View>
                                        )}

                                        {modalContent === 'Política de Privacidade' && (
                                            <View>
                                                <Text style={[styles.modalText, colorScheme === 'dark' && { color: '#fff' }]}>Política de Privacidade</Text>
                                                <Text style={[styles.modalInfo, colorScheme === 'dark' && { color: '#fff' }]}>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Numquam, autem esse obcaecati atque quos officiis culpa soluta fuga! In sunt animi officiis distinctio possimus ad omnis sit natus pariatur fuga?</Text>
                                            </View>
                                        )}

                                        {modalContent === 'Sair do App' && (
                                            <View>
                                                {/* Ícone */}
                                                <Icon name="sign-out" size={20} color="red" style={styles.icon} />

                                                <Text style={[styles.Titulosair, colorScheme === 'dark' && { color: '#fff' }]}>Tem certeza que deseja sair?</Text>
                                                <Text style={[styles.modalDescriptionText, colorScheme === 'dark' && { color: '#fff' }]}>
                                                    Ao sair, você precisará fazer login novamente para acessar sua conta.
                                                </Text>

                                                {/* Botões de ação */}
                                                <View style={styles.buttonContainer}>
                                                    <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                                                        <Text style={styles.buttonText}>Cancelar</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.exitButton}
                                                        onPress={handleLogoff}
                                                    >
                                                        <Text style={styles.buttonText}>Sair</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}

                                        {modalContent === 'Deletar Conta' && (
                                            <View>
                                                {/* Ícone de Lixeira */}
                                                <Icon name="trash" size={20} color="red" />

                                                <Text style={[styles.modalText, colorScheme === 'dark' && { color: '#fff' }]}>Tem certeza  que deseja deletar sua conta?</Text>
                                                <Text style={[styles.modalDescriptionText, colorScheme === 'dark' && { color: '#fff' }]}>
                                                    Tem certeza de que deseja excluir esta Conta?
                                                </Text>

                                                {/* Botões de Ação */}
                                                <View style={styles.buttonContainer}>
                                                    <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                                                        <Text style={styles.buttonText}>Cancelar</Text>
                                                    </TouchableOpacity>
                                                    <TouchableOpacity
                                                        style={styles.exitButton}
                                                        onPress={handleDelete}>
                                                        <Text style={styles.buttonText}>Deletar</Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                </BlurView>
                            </Modal>
                        </ScrollView>

                        {/* Modal para solicitar a senha */}
                        <Modal visible={showPasswordModal} transparent={true} animationType="slide">
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                                <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
                                    <Text>Digite sua senha para confirmar:</Text>
                                    <TextInput
                                        secureTextEntry
                                        style={{ borderWidth: 1, borderColor: 'gray', marginTop: 10, padding: 10 }}
                                        placeholder="Insira a Senha"
                                        value={passwordInput}
                                        onChangeText={(text) => setPasswordInput(text)}
                                    />
                                    <TouchableOpacity onPress={handlePasswordSubmit} style={{ backgroundColor: '#ff8c00', padding: 10, marginTop: 10 }}>
                                        <Text style={{ color: 'white' }}>Confirmar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

                        {/* Renderiza a notificação se showNotification for verdadeiro */}
                        {showNotification && (
                            <View style={[
                                styles.notificationContainer,
                                colorScheme === 'dark' && { backgroundColor: '#000' }  // Preto no Dark Mode
                            ]}>
                                <Text style={[styles.notificationText, colorScheme === 'dark' && { color: '#fff' }]}>
                                    Você tem que validar seu e-mail para usar todas as funcionalidades do aplicativo.
                                </Text>
                                <TouchableOpacity
                                    style={styles.ignoreButton}
                                    onPress={() => {
                                        setShowNotification(false);
                                    }}
                                >
                                    <Text style={[styles.ignoreButtonText, colorScheme === 'dark' && { color: '#fff' }]}>Ignorar</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </SafeAreaView>
                <StatusBar />
            </DrawerScreneWrapper>

        </KeyboardAvoidingView >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF8E1',
    },
    containerOpcoes: {
        backgroundColor: '#F5F0EEFF',
        width: isPortrait ? '90%' : '90%',
        height: isPortrait ? 'auto' : '200%',
        borderRadius: 16,
        padding: 10,
        marginLeft: '6%',
        marginTop: isPortrait ? '6%' : '3%',
        marginBottom: isPortrait ? '6%' : '3%',
        shadowColor: '#000',
        shadowOffset: { width: 3, height: 3 },
        shadowOpacity: 0.5,
        shadowRadius: 4.5,
        elevation: 10,
    },
    containerScroll: {
        backgroundColor: '#fff',
        marginTop: '15%',
        flexGrow: 1,
        paddingBottom: '35%',
        borderRadius: 26,
        marginBottom: 10,

    },
    profileCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        borderColor: '#ff8c00',
        borderWidth: 2,
        marginBottom: 10,
        zIndex: 1
    },

    profileImage: {
        width: '100%',
        height: '100%',
        borderRadius: 70,
    },
    placeholderText: {
        color: '#888',
        textAlign: 'center',
    },
    usernameText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginTop: -65,
        marginLeft: 30,
        right: -90,
    },
    notificationContainer: {
        position: 'absolute',
        top: 50,
        right: 10,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 5000,
    },
    notificationText: {
        fontSize: 16,
        fontWeight: 'bold',
        zIndex: 99
    },
    ignoreButton: {
        backgroundColor: '#ff8c00',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    ignoreButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    line: {
        marginTop: '5%',
        height: 1,
        width: '100%',
        backgroundColor: '#ccc',
        marginVertical: 10,
    },
    message: {
        marginTop: '5%',
        fontSize: 15,
        color: '#333',
        fontWeight: 'bold',
        textAlign: 'left',
        marginLeft: isPortrait ? '5%' : '5%',

    },

    Options: {
        width: '95%',
        marginTop: '5%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2.62,
        elevation: 4,
        marginVertical: 5,
        marginLeft: '2%'
    },
    switchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        justifyContent: 'space-between',
        marginLeft: '4%',
        marginTop: '5%',
        width: '90%',
    },
    switch: {
        width: '70%',
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        backgroundColor: '#ddd',
        position: 'relative',

    },
    circle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        position: 'absolute',

    },
    switchOn: {
        backgroundColor: '#ff8c00',
    },
    switchOff: {
        backgroundColor: '#ddd',
    },
    circleOn: {
        backgroundColor: '#fff',
        right: 5,

    },
    circleOff: {
        backgroundColor: '#fff',
        left: 5,

    },
    textSwitch: {
        fontSize: 16,
    },
    blurContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalView: {
        width: '90%',
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        position: 'relative',
    },
    modalText: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
    },
    Titulosair: {
        marginBottom: 15,
        textAlign: 'center',
        fontSize: 18,
        marginTop: '-10%'
    },
    modalDescriptionText: {
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 15,
        paddingHorizontal: 10,
        width: '100%',
    },
    updateButton: {
        backgroundColor: '#ff8c00',
        padding: 10,
        borderRadius: 5,
        marginTop: 15,
        alignItems: 'center',
        width: '100%',
    },
    updateButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    closeButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        padding: 10,
        zIndex: 10,
    },
    closeButtonText: {
        color: 'red',
        fontSize: 24,
        fontWeight: 'bold',
    },
    updateButtonDisabled: {
        backgroundColor: '#b0b0b0',
    },
    warningText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
        fontSize: 14,
    },
    icon: {
        marginBottom: 10,
    },
    descriptionText: {
        textAlign: 'center',
        marginBottom: 20,
    },
    rememberChoiceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    rememberChoiceText: {
        marginLeft: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        backgroundColor: 'lightgray',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginRight: 5,
        alignItems: 'center',
    },
    exitButton: {
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
        flex: 1,
        marginLeft: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    containermenu:
    {
        padding: 16,
        paddingTop: 10,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    header:
    {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    username:
    {
        fontSize: 16,
        fontWeight: "700",
        flex: 1,
    },
    containerIdiomas: {
        padding: 20,
    },

    idiomasList: {
        maxHeight: 200,
        marginTop: 10,
        borderRadius: 8,
        overflow: 'hidden',
    },
    idiomaItem: {
        padding: 10,
    },
    idiomaText: {
        fontSize: 16,
    },
    selectedLanguageText: {
        marginTop: 10,
        fontSize: 16,
        marginLeft: isPortrait ? '5%' : '5%',

    },
    text: {
        marginLeft: isPortrait ? '5%' : '5%',
    }
});