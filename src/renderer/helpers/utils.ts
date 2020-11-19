/* eslint-disable no-bitwise */
import { PhoneNumberUtil } from "google-libphonenumber";
import { Chat, Handle } from "@server/databases/chat/entity";

export const addTapbackTextMap = {
    like: "Liked",
    dislike: "Disliked",
    love: "Loved",
    question: "Questioned",
    emphasize: "Emphasized",
    laugh: "Laugh"
};

export const removeTapbackTextMap = {
    like: "a like",
    dislike: "a dislike",
    love: "a heart",
    question: "a question mark",
    emphasize: "an exclamation",
    laugh: "a laugh"
};

export const getTimeText = (date: Date) => {
    return date.toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true });
};

export const getDateText = (date: Date, useToday = false) => {
    const now = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const nowLocale = now.toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    const msgLocale = date.toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric" });
    const yLocale = yesterday.toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric" });

    if (nowLocale === msgLocale) return useToday ? "Today" : getTimeText(date);
    if (yLocale === msgLocale) return "Yesterday";
    return date.toLocaleString("en-US", { month: "numeric", day: "numeric", year: "numeric" }).slice(0, -2);
};

export const getiMessageNumberFormat = (address: string, countryCode: string) => {
    if (!address) return address;

    // If it's an email, just return the email
    if (address.includes("@")) return address;

    try {
        const phoneUtil = PhoneNumberUtil.getInstance();
        const number = phoneUtil.parseAndKeepRawInput(address, countryCode);
        const formatted = phoneUtil.formatOutOfCountryCallingNumber(number, countryCode);
        return `+${formatted}`;
    } catch {
        return "ERR: >MAXLEN";
    }
};

export const getFullName = (participant: Handle) => {
    if (!participant.firstName && !participant.lastName) return null;
    if (participant.firstName && !participant.lastName) return participant.firstName;
    if (!participant.firstName && participant.lastName) return participant.lastName;
    return `${participant.firstName} ${participant.lastName}`;
};

export const getFirstName = (participant: Handle) => {
    if (!participant.firstName && !participant.lastName) return null;
    if (participant.firstName && !participant.lastName) return participant.firstName;
    if (!participant.firstName && participant.lastName) return participant.lastName;
    return participant.firstName;
};

export const getSender = (participant: Handle, fullName = true) => {
    if (!participant) return "";
    if (!participant.firstName && !participant.lastName) {
        return getiMessageNumberFormat(participant.address, participant.country);
    }

    if (fullName) return getFullName(participant);
    return getFirstName(participant);
};

export const generateChatTitle = (chat: Chat) => {
    if (!chat) return "";
    if (chat.displayName) return chat.displayName;

    const members = [];
    for (const i of chat.participants) {
        if (!i.firstName && !i.lastName) {
            members.push(getiMessageNumberFormat(i.address, i.country));
        } else if (chat.participants.length === 1) {
            members.push(getFullName(i));
        } else {
            members.push(getFirstName(i)); // TODO: Only get first name
        }
    }

    if (members.length === 0) return chat.chatIdentifier;
    if (members.length === 1) return members[0];
    if (members.length <= 4) {
        const title = members.join(", ");
        const idx = title.lastIndexOf(", ");
        return idx === -1 ? title : `${title.substring(0, idx)} & ${title.substring(idx + 2)}`;
    }

    const title = members.slice(0, 3).join(", ");
    return `${title} & ${members.length - 3} others`;
};

export const generateChatIconText = (chat: Chat) => {
    if (!chat) return "?";

    // If its a group chat
    if (chat.participants.length > 1) {
        const groupChatInitials = ["?", "?"];
        // First member
        if (chat.participants[0].firstName && chat.participants[0].lastName) {
            // eslint-disable-next-line max-len
            groupChatInitials[0] =
                chat.participants[0].firstName.substr(0, 1) + chat.participants[0].lastName.substr(0, 1);
        }
        if (!chat.participants[0].firstName && !chat.participants[0].lastName) {
            groupChatInitials[0] = "?";
        }
        if (chat.participants[0].firstName && !chat.participants[0].lastName) {
            groupChatInitials[0] = chat.participants[0].firstName.substr(0, 1);
        }
        if (!chat.participants[0].firstName && chat.participants[0].lastName) {
            groupChatInitials[0] = chat.participants[0].lastName.substr(0, 1);
        }

        // Second Member
        if (chat.participants[1].firstName && chat.participants[1].lastName) {
            // eslint-disable-next-line max-len
            groupChatInitials[1] =
                chat.participants[1].firstName.substr(0, 1) + chat.participants[1].lastName.substr(0, 1);
        }
        if (!chat.participants[1].firstName && !chat.participants[1].lastName) {
            groupChatInitials[1] = "?";
        }
        if (chat.participants[1].firstName && !chat.participants[1].lastName) {
            groupChatInitials[1] = chat.participants[1].firstName.substr(0, 1);
        }
        if (!chat.participants[1].firstName && chat.participants[1].lastName) {
            groupChatInitials[1] = chat.participants[1].lastName.substr(0, 1);
        }

        return groupChatInitials;
    }

    if (chat.participants.length === 1) {
        if (chat.participants[0].firstName && chat.participants[0].lastName) {
            // eslint-disable-next-line max-len
            return chat.participants[0].firstName.substr(0, 1) + chat.participants[0].lastName.substr(0, 1);
        }
        if (!chat.participants[0].firstName && !chat.participants[0].lastName) {
            return "?";
        }
        if (chat.participants[0].firstName && !chat.participants[0].lastName) {
            return chat.participants[0].firstName.substr(0, 1);
        }
        if (!chat.participants[0].firstName && chat.participants[0].lastName) {
            return chat.participants[0].lastName.substr(0, 1);
        }
    }

    return "?";
};

export const generateDetailsIconText = (chat: Chat) => {
    if (!chat) return "?";

    const detailsInitials = [];
    for (let i = 0; i < chat.participants.length; i += 1) {
        if (chat.participants[i].firstName && chat.participants[i].lastName) {
            // eslint-disable-next-line max-len
            detailsInitials.push(
                chat.participants[i].firstName.substr(0, 1) + chat.participants[i].lastName.substr(0, 1)
            );
        }
        if (!chat.participants[i].firstName && !chat.participants[i].lastName) {
            detailsInitials.push("?");
        }
        if (chat.participants[i].firstName && !chat.participants[i].lastName) {
            detailsInitials.push(chat.participants[i].firstName.substr(0, 1));
        }
        if (!chat.participants[i].firstName && chat.participants[i].lastName) {
            detailsInitials.push(chat.participants[i].lastName.substr(0, 1));
        }
    }

    return detailsInitials;
};

export const generateReactionsDisplayIconText = (handle: Handle) => {
    if (!handle) return "?";
    if (handle === null) return "?";

    const detailsInitials = [];
    if (handle.firstName && handle.lastName) {
        // eslint-disable-next-line max-len
        return handle.firstName.substr(0, 1) + handle.lastName.substr(0, 1);
    }
    if (!handle.firstName && !handle.lastName) {
        return "?";
    }
    if (handle.firstName && !handle.lastName) {
        return handle.firstName.substr(0, 1);
    }
    if (!handle.firstName && handle.lastName) {
        return handle.lastName.substr(0, 1);
    }

    return "?";
};

export const sanitizeStr = (val: string) => {
    if (!val) return val;
    const objChar = String.fromCharCode(65532);

    // Recursively replace all "obj" hidden characters
    let output = val;
    while (output.includes(objChar)) {
        output = output.replace(String.fromCharCode(65532), "");
    }

    return output.trim();
};

export const parseUrls = (text: string) => {
    // eslint-disable-next-line max-len
    const regexp = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\\-\\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/gim;
    const parser = new RegExp(regexp);
    const matches = text.match(parser);
    return matches ?? [];
};

export const generateUuid = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

type LongLat = { longitude: number; latitude: number };
export const parseAppleLocation = (appleLocation: string): LongLat => {
    const lines = appleLocation.split("\n");
    const url = lines[5];
    const query = url.split("&q=")[1];

    if (query.includes("\\")) {
        return {
            longitude: Number.parseFloat(query.split("\\,")[0]),
            latitude: Number.parseFloat(query.split("\\,")[1])
        };
    }

    return {
        longitude: Number.parseFloat(query.split(",")[0]),
        latitude: Number.parseFloat(query.split(",")[1])
    };
};

export const bytesToSize = bytes => {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    if (bytes === 0) {
        return "n/a";
    }

    const i = Math.floor(Math.log(bytes) / Math.log(1024));

    if (i === 0) {
        return `${bytes} ${sizes[i]}`;
    }

    return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
};
