import { StyleSheet, View, Text, Image } from 'react-native';
import { DrawerToggleButton } from '@react-navigation/drawer';
import { DrawerScreneWrapper } from '../components/drawer-scene-wrapper';

const Home = () => {
    return (
        <DrawerScreneWrapper>
            <View style={styles.container}>
                <View style={styles.header}>
                    <Image
                        source={{ uri: "https://github.com/WesleyS08.png" }}
                        style={styles.img}
                    />
                    <View style={styles.user}>
                        <Text style={styles.hi}>Olá</Text>
                        <Text style={styles.username}>Wesley Silva</Text>
                    </View>
                    <DrawerToggleButton />
                </View>
            </View>
        </DrawerScreneWrapper>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        paddingTop: 32,
        backgroundColor: '#ffffff',
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
    },
    img: {
        width: 50,
        height: 50,
        borderRadius: 12,
    },
    user: {
        flex: 1,
        justifyContent: 'center',
    },
    hi: {
        fontSize: 14,
    },
    username: {
        fontSize: 16,
        fontWeight: "700",
    },
});

export default Home; 