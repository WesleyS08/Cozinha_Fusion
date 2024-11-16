import  supabase  from './supabaseClient';

const logSuccess = (message: string) => {
    console.log(`\x1b[32m%s\x1b[0m`, message);
};

const logError = (message: string) => {
    console.log(`\x1b[31m%s\x1b[0m`, message); 
};

const logInfo = (message: string) => {
    console.log(`\x1b[34m%s\x1b[0m`, message); 
};

export const getUserInfo = async () => {
    logInfo('Obtendo informações do usuário...');
    const { data, error: authError } = await supabase.auth.getUser ();

    if (authError) {
        logError(`Erro ao obter dados de autenticação do usuário: ${(authError as Error).message}`);
        return null;
    }

    const user = data?.user;
    logInfo(`User  data: ${JSON.stringify(user, null, 2)}`);

    if (user) {
        const userInfo = {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata, 
        };

        logInfo(`Informações do usuário: ${JSON.stringify(userInfo, null, 2)}`);
        
        try {
            logInfo('Buscando dados do usuário no banco de dados...');
            const { data: userData, error } = await supabase
                .from('usuarios')
                .select('*')
                .eq('email', user.email);

            if (error) {
                logError(`Erro ao buscar dados do usuário: ${(error as Error).message}`);
                throw error;
            }

            if (!userData || userData.length === 0) {
                logInfo('Nenhum dado encontrado para o usuário.');
                return userInfo; 
            }

            if (userData.length > 1) {
                logError('Erro: múltiplos registros encontrados para o usuário.');
                return null;
            }

            const singleUserData = userData[0]; 
            logSuccess(`Dados do usuário obtidos com sucesso: ${JSON.stringify(singleUserData)}`);

            return { ...userInfo, ...singleUserData, name: singleUserData.nome }; 
        } catch (error: unknown) {
            if (error instanceof Error) {
                logError(`Erro ao obter informações do usuário: ${error.message}`);
            } else {
                logError('Erro desconhecido ao obter informações do usuário.');
            }
            return null;
        }
    } else {
        logInfo('Nenhum usuário encontrado.');
        return null;
    }
};