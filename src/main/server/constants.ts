export const DEFAULT_CONFIG_ITEMS: { [key: string]: Function } = {
    serverAddress: () => "",
    passphrase: () => "",
    lastFetch: () => 0,
    currentTheme: () => "Dark",
    allThemes: () => ["Dark", "Light", "Nord"],
    isMakingNewChat: () => "0",
    chunkSize: () => 1024,
    globalNotificationsMuted: () => "0",
    globalNotificationsDisabled: () => "0",
    importContactsFrom: () => "serverVCF",
    closeToTray: () => "1",
    startWithOS: () => "1",
    sendAudio: () => "1",
    capitalizeFirstLetter: () => "1",
    gradientMessages: () => "1",
    colorfulContacts: () => "1",
    leftTitlebar: () => "1",
    useNativeTitlebar: () => "0",
    useNativeEmojis: () => "0",
    messageFontSize: () => "14px"
};

export const DEFAULT_DARK_THEME: { [key: string]: Function } = {
    name: () => "Dark",
    titleBarCloseColor: () => "#fc4e50",
    titleBarMinimizeColor: () => "#febe30",
    titleBarMaximizeColor: () => "#38d744",
    searchBackgroundColor: () => "#545454",
    searchPlaceholderColor: () => "#868686",
    sidebarColor: () => "#323232",
    blueColor: () => "#0349cd",
    mainTitleColor: () => "#ffffff",
    subTitleColor: () => "#b5b5b5",
    secondaryColor: () => "#3a3a3a",
    backgroundColor: () => "#1e1e1e",
    rightSidePrimaryColor: () => "#ffffff",
    rightSideSecondaryColor: () => "#b5b5b5",
    rightSideDetailsTitleColor: () => "#007aff",
    chatLabelColor: () => "#797878",
    incomingMessageColor: () => "#6b6b6b",
    incomingMessageTextColor: () => "#ffffff",
    outgoingMessageColor: () => "#006ee4",
    outgoingMessageTextColor: () => "#ffffff",
    attachmentButtonColor: () => "#545454",
    attachmentClipColor: () => "#ffffff",
    sendButtonColor: () => "#007aff",
    sendArrowColor: () => "#ffffff",
    newChatButtonColor: () => "#545454",
    sidebarBlurredColor: () => "#242424",
    secondaryBlurredColor: () => "#1e1e1e"
};

export const DEFAULT_LIGHT_THEME: { [key: string]: Function } = {
    name: () => "Light",
    titleBarCloseColor: () => "#fc4e50",
    titleBarMinimizeColor: () => "#febe30",
    titleBarMaximizeColor: () => "#38d744",
    searchBackgroundColor: () => "#bebebe",
    searchPlaceholderColor: () => "#868686",
    sidebarColor: () => "#dbdbdb",
    blueColor: () => "#0349cd",
    mainTitleColor: () => "#000000",
    subTitleColor: () => "#454545",
    secondaryColor: () => "#f8f8f8",
    backgroundColor: () => "#ffffff",
    rightSidePrimaryColor: () => "#000000",
    rightSideSecondaryColor: () => "#454545",
    rightSideDetailsTitleColor: () => "#007aff",
    chatLabelColor: () => "#797878",
    incomingMessageColor: () => "#bcbcbc",
    incomingMessageTextColor: () => "#ffffff",
    outgoingMessageColor: () => "#006ee4",
    outgoingMessageTextColor: () => "#ffffff",
    attachmentButtonColor: () => "#bebebe",
    attachmentClipColor: () => "#ffffff",
    sendButtonColor: () => "#007aff",
    sendArrowColor: () => "#ffffff",
    newChatButtonColor: () => "#bebebe",
    sidebarBlurredColor: () => "#bbbbbb",
    secondaryBlurredColor: () => "#e4e4e4"
};

export const DEFAULT_NORD_THEME: { [key: string]: Function } = {
    name: () => "Nord",
    titleBarCloseColor: () => "#fc4e50",
    titleBarMinimizeColor: () => "#febe30",
    titleBarMaximizeColor: () => "#38d744",
    searchBackgroundColor: () => "#4C566A",
    searchPlaceholderColor: () => "#868686",
    sidebarColor: () => "#434C5E",
    blueColor: () => "#0349cd",
    mainTitleColor: () => "#ECEFF4",
    subTitleColor: () => "#D8DEE9",
    secondaryColor: () => "#3B4252",
    backgroundColor: () => "#2E3440",
    rightSidePrimaryColor: () => "#ECEFF4",
    rightSideSecondaryColor: () => "#D8DEE9",
    rightSideDetailsTitleColor: () => "#007aff",
    chatLabelColor: () => "#797878",
    incomingMessageColor: () => "#4C566A",
    incomingMessageTextColor: () => "#ffffff",
    outgoingMessageColor: () => "#006ee4",
    outgoingMessageTextColor: () => "#ffffff",
    attachmentButtonColor: () => "#4C566A",
    attachmentClipColor: () => "#ffffff",
    sendButtonColor: () => "#007aff",
    sendArrowColor: () => "#ffffff",
    newChatButtonColor: () => "#4C566A",
    sidebarBlurredColor: () => "#2b303a",
    secondaryBlurredColor: () => "#2E3440"
};
