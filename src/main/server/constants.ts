export const DEFAULT_CONFIG_ITEMS: { [key: string]: Function } = {
    serverAddress: () => "",
    passphrase: () => "",
    lastFetch: () => 0,
    theme: () => "dark",
    isMakingNewChat: () => false,
    chunkSize: () => 1024,
    isDetailsOpen: () => false,
    isReactionsOpen: () => false
};
