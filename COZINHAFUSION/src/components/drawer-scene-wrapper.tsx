import { ReactNode } from 'react';
import { useDrawerProgress } from '@react-navigation/drawer';
import Animated, { useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

export function DrawerScreneWrapper({ children }: { children: ReactNode }) {
    const progress = useDrawerProgress();
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{
            scale: interpolate(progress?.value ?? 0, [0, 1], [1, 0.8], Extrapolation.CLAMP)
        },
        {
            translateX: interpolate(progress?.value ?? 0, [0, 1], [0, 200], Extrapolation.CLAMP)
        },
        {
            rotateY: interpolate(progress?.value ?? 0, [0, 1], [0, -25], Extrapolation.CLAMP) + "deg",
        },
        ],
        borderRadius: 20,
        overflow: 'hidden',
    }));

    return (
        <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            {children}
        </Animated.View>
    );
}