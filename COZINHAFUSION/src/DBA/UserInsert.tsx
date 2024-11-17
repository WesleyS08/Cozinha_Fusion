import supabase from './supabaseClient';

export const fetchImageAsBase64 = async (imagePath:any) => {
    try {
        console.log(`Fetching image from ${imagePath}...`);
        const response = await fetch(imagePath);
        if (!response.ok) {
            throw new Error('Erro ao buscar a imagem');
        }

        const blob = await response.blob();
        const reader = new FileReader();

        return new Promise((resolve, reject) => {
            reader.onloadend = () => {
                console.log('Image converted to base64 successfully.');
                console.log('Base64 Image:', reader.result.split(',')[1]);
                resolve(reader.result.split(',')[1]);
            };
            reader.onerror = (error) => {
                console.error('Error converting image to base64:', error);
                reject(error);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.error('Error fetching image:', error);
        return null;
    }
};

export const handleImageUpload = async (base64Image, userId) => {
    console.log('Enviando imagem e ID do usuário...');
    console.log('Base64 Image:', base64Image);
    console.log('User ID:', userId);

    try {
        const bucketName = 'FotosdePerfil';

        // Verifica se o bucket já existe
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        if (bucketsError) {
            console.error('Erro ao listar os buckets:', bucketsError.message);
            return;
        }

        const bucketExists = buckets.some(bucket => bucket.name === bucketName);
        if (!bucketExists) {
            const { error: createBucketError } = await supabase.storage.createBucket(bucketName);
            if (createBucketError) {
                console.error(`Erro ao criar bucket: ${createBucketError.message}`);
                return;
            }
            console.log(`Bucket "${bucketName}" criado com sucesso.`);
        }

        // Busca o nome do usuário no banco
        const { data: userData, error: userDataError } = await supabase
            .from('usuarios')
            .select('nome')
            .eq('id', userId)
            .single();

        if (userDataError) {
            console.error(`Erro ao buscar nome do usuário: ${userDataError.message}`);
            return;
        }

        const userName = userData.nome;
        const fileName = `${userId}.png`;  // Ou use algo único como UUID ou timestamp
        const folderPath = `${userName}/${fileName}`;

        console.log('Folder Path:', folderPath);

        // Converte Base64 para ArrayBuffer
        const arrayBuffer = decodeBase64(base64Image);

        // Faz o upload da imagem com upsert (substitui se já existir)
        const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(folderPath, arrayBuffer, {
                contentType: 'image/png',
                cacheControl: '3600',
                upsert: true,  
            });

        if (uploadError) {
            console.error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
            return;
        }

        console.log('Imagem enviada com sucesso.');

        const { data: publicUrlData, error: publicUrlError } = supabase.storage
            .from(bucketName)
            .getPublicUrl(folderPath);

        if (publicUrlError) {
            console.error('Erro ao obter URL pública:', publicUrlError.message);
            return null;
        }

        if (publicUrlData) {
            console.log('Public URL:', publicUrlData.publicUrl);
            return publicUrlData.publicUrl;  
        } else {
            console.error('Erro ao gerar URL pública.');
            return null;
        }
    } catch (err) {
        console.error('Erro ao manipular o upload da imagem:', err);
        throw err;
    }
};




const decodeBase64 = (base64:any) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer; 
};