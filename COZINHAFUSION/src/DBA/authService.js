import supabase from "./supabaseClient";



export const login = async (identifier, password) => {
    let userEmail = null;
    let userName = null;

    if (identifier.includes('@')) {
        userEmail = identifier.toLowerCase();
        console.log('Identificado como Email:', userEmail);
    } else {
        userName = identifier;
        console.log('Identificado como Nome de Usuário:', userName);
    }

    try {
        if (userEmail) {
            console.log('Tentando fazer login com e-mail:', userEmail);
            console.log('Senha para login:', password);

            const { user, session, error } = await supabase.auth.signInWithPassword({
                email: userEmail,
                password,
            });

            console.log('Resultado do login com e-mail:', { user, session, error });
            if (error) {
                console.error('Erro no login com e-mail:', error.message);
                return { user: null, session: null, error: error.message };
            }
            return { user, session, error: null };
        }
        else if (userName) {
            console.log('Tentando buscar usuário pelo nome de usuário:', userName);
            const { data: userData, error: userError } = await supabase
                .from('usuarios')
                .select('*')
                .ilike('nome', userName)
                .single();

            console.log('Dados do usuário encontrados:', userData);
            console.log('Erro ao buscar usuário pelo nome:', userError);

            if (userError) {
                console.error('Erro ao buscar usuário:', userError);
                return { user: null, session: null, error: userError.message };
            }

            if (userData) {
                const emailToLogin = userData.email.toLowerCase();
                console.log('Fazendo login com e-mail do usuário encontrado:', emailToLogin);
                const { user, session, error } = await supabase.auth.signInWithPassword({
                    email: emailToLogin,
                    password,
                });

                console.log('Resultado do login com e-mail do usuário encontrado:', { user, session, error });
                return { user, session, error };
            } else {
                console.log('Usuário não encontrado pelo nome de usuário');
                return { user: null, session: null, error: 'Usuário não encontrado pelo nome de usuário' };
            }
        } else {
            console.error('Nenhum identificador válido fornecido para login.');
            return { user: null, session: null, error: 'Identificador inválido fornecido' };
        }

    } catch (err) {
        console.error('Erro durante o processo de login:', err);
        return { user: null, session: null, error: err.message };
    }
};

const updateUserIdInUsuarios = async (userId, email) => {
    console.log('Atualizando id do usuário na tabela usuarios...');
    const { error } = await supabase
        .from('usuarios')
        .update({ id: userId }) 
        .eq('email', email);

    if (error) {
        console.error('Erro ao atualizar o id do usuário na tabela usuarios:', error);
        return {
            success: false,
            error: {
                message: 'Erro ao atualizar o id do usuário na tabela usuarios.'
            }
        };
    }

    console.log('Id do usuário atualizado com sucesso!');
    return { success: true };
};

export const register = async (nome, email, password) => {
    console.log('Iniciando cadastro...');
    try {
        console.log('Verificando se o e-mail já está cadastrado...');
        const { data: existingUser, error: checkError } = await supabase
            .from('auth.users')
            .select('email')
            .eq('email', email)
            .single();

        if (existingUser) {
            console.log('E-mail já cadastrado!');
            return {
                user: null,
                session: null,
                error: {
                    message: 'Este email já está cadastrado'
                }
            };
        }

        console.log('Verificando se o nome de usuário já está em uso...');
        const { data: existingUsernameUser, error: checkUsernameError } = await supabase
            .from('usuarios')
            .select('nome')
            .eq('nome', nome)
            .single();

        if (existingUsernameUser) {
            console.log('Nome de usuário já em uso!');
            return {
                user: null,
                session: null,
                error: {
                    message: 'Este nome de usuário já está em uso'
                }
            };
        }

        console.log('Criando conta...');
        const { user, session, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    display_name: nome
                }
            }
        });

        if (signUpError) {
            console.error('Erro ao criar conta:', signUpError);
            if (signUpError.message.includes('Network')) {
                return {
                    user: null,
                    session: null,
                    error: {
                        message: 'Problemas de conexão com o servidor'
                    }
                };
            }

            if (signUpError.message.includes('Email')) {
                return {
                    user: null,
                    session: null,
                    error: {
                        message: 'Email inválido ou já está em uso'
                    }
                };
            }

            return { user: null, session: null, error: signUpError };
        }

        console.log('Salvando usuário na tabela usuarios...');
        const { data: savedUser, error: saveError } = await supabase
            .from('usuarios')
            .insert([
                {
                    nome,
                    email,
                    // Outros campos necessários, se houver
                }
            ])
            .select(); // Adicione .select() para obter o registro inserido

        if (saveError) {
            console.error('Erro ao salvar usuário na tabela usuarios:', saveError);
            await supabase.auth.api.deleteUser(user?.id); // Use a optional chaining

            return {
                user: null,
                session: null,
                error: {
                    message: 'Erro ao salvar usuário na tabela usuarios. Cadastro revertido.'
                }
            };
        }

        // Obter o ID do usuário recém-criado
        const userIdFromUsuarios = savedUser[0]?.id; // Presumindo que a tabela usuarios retorna o id

        if (!userIdFromUsuarios) {
            console.error('ID do usuário não encontrado na tabela usuarios');
            return {
                user: null,
                session: null,
                error: {
                    message: 'Erro ao encontrar o ID do usuário após o cadastro.'
                }
            };
        }

        console.log('Atualizando id do usuário na tabela usuarios...');
        const updateResult = await updateUserIdInUsuarios(userIdFromUsuarios, email); 
        if (!updateResult.success) {
            return {
                user: null,
                session: null,
                error: updateResult.error
            };
        }

        console.log('Cadastro concluído com sucesso!');
        return { user, session, error: null };

    } catch (error) {
        console.error('Erro durante o cadastro:', error);
        return {
            user: null,
            session: null,
            error: {
                message: 'Ocorreu um erro durante o cadastro'
            }
        };
    }
};
