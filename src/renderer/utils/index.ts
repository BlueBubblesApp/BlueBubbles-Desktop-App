import { PhoneNumberUtil } from "google-libphonenumber";

export const getTimeText = (date: Date) => {
    return date.toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
};

export const getDateText = (date: Date) => {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const nowLocale = now.toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    const msgLocale = date.toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    const yLocale = yesterday.toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric" });

    if (nowLocale === msgLocale) return getTimeText(date);
    if (yLocale === msgLocale) return "Yesterday";
    return date.toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric" }).slice(0, -2);
};

export const getiMessageNumberFormat = (address: string) => {
    // If it's an email, just return the email
    if (address.includes("@")) return address;

    const phoneUtil = PhoneNumberUtil.getInstance();
    const number = phoneUtil.parseAndKeepRawInput(address, "US");
    const formatted = phoneUtil.formatOutOfCountryCallingNumber(number, "US");
    return `+${formatted}`;
};
