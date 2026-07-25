export const motionTokens = {
    duration: {
        fast: 0.18,
        normal: 0.32,
        slow: 0.55,
    },
    ease: {
        standard: [0.22, 1, 0.36, 1] as [number, number, number, number],
        enter: [0.16, 1, 0.3, 1] as [number, number, number, number],
        exit: [0.7, 0, 0.84, 0] as [number, number, number, number],
    },
} as const;