import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
    .use(initReactI18next)
    .init({
        resources: {
            pt: {
                translation: {
                    "Alterar Idioma": "Alterar Idioma",
                    "Outras chaves": "Outros valores em português",
                    "Alterar a senha": "Alterar a senha",
                    "Perfil": "Perfil",
                    "Adicionar Imagem": "Adicionar Imagem",
                    "Carregando": "Carregando...",
                    "Configurações de Conta": "Configurações de Conta",
                    "Editar dados": "Editar dados",
                    "Mais Opções": "Mais Opções",
                    "Sobre nós": "Sobre nós",
                    "Política de Privacidade": "Política de Privacidade",
                    "Opções Avançadas": "Opções Avançadas",
                    "Sair do App": "Sair do App",
                    "Deletar Conta": "Deletar Conta"
                }
            },
            en: {
                translation: {
                    "Alterar Idioma": "Change Language",
                    "Outras chaves": "Other values in English",
                    "Alterar a senha": "Change Password",
                    "Perfil": "Profile",
                    "Adicionar Imagem": "Add Image",
                    "Carregando": "Loading...",
                    "Configurações de Conta": "Account Settings",
                    "Editar dados": "Edit Data",
                    "Mais Opções": "More Options",
                    "Sobre nós": "About Us",
                    "Política de Privacidade": "Privacy Policy",
                    "Opções Avançadas": "Advanced Options",
                    "Sair do App": "Log Out",
                    "Deletar Conta": "Delete Account"
                }
            },
            es: {
                translation: {
                    "Alterar Idioma": "Cambiar idioma",
                    "Outras chaves": "Otros valores en español",
                    "Alterar a senha": "Cambiar contraseña",
                    "Perfil": "Perfil",
                    "Adicionar Imagem": "Añadir imagen",
                    "Carregando": "Cargando...",
                    "Configurações de Conta": "Configuración de la cuenta",
                    "Editar dados": "Editar datos",
                    "Mais Opções": "Más opciones",
                    "Sobre nós": "Sobre nosotros",
                    "Política de Privacidade": "Política de privacidad",
                    "Opções Avançadas": "Opciones avanzadas",
                    "Sair do App": "Salir de la aplicación",
                    "Deletar Conta": "Eliminar cuenta",
                }
            },
        },
        lng: "pt",
        fallbackLng: "pt",
        interpolation: {
            escapeValue: false
        },
        compatibilityJSON: 'v3'
    });

export default i18n;
