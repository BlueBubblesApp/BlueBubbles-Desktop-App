import * as vCard from "vcf";

export const mergeUint8Arrays = (first: Uint8Array, second: Uint8Array) => {
    const temp = new Uint8Array(first.byteLength + second.byteLength);
    temp.set(first, 0);
    temp.set(second, first.byteLength);
    return temp;
};

type Contact = { firstName: string; lastName: string; address: string; avatar: string };
export const parseVCards = (vcf: string): Contact[] => {
    const parsed: any[] = vCard.parse(vcf);

    const contacts: Contact[] = [];
    for (const contact of parsed) {
        const nameData = contact.get("n").toJSON();
        const lastName = nameData[3][0].replace(/\?\?/, "");
        const firstName = nameData[3][1].replace(/\?\?/, "");
        const photo = contact.get("photo");
        let numbers = contact.get("tel") ?? [];
        let emails = contact.get("email") ?? [];

        // Force it into an array
        if (!Array.isArray(numbers)) numbers = [numbers];
        if (!Array.isArray(emails)) emails = [emails];

        // Parse out photo
        let avatar = null;
        if (photo) {
            const photoData = photo.toJSON();
            if (photoData[2] === "text" && photoData[1].encoding.toLowerCase() === "base64") {
                avatar = `data:image/${photoData[1].type};base64,${photoData[3]}`;
            }
        }

        // Create entries for phone numbers
        for (const addressData of numbers) {
            const addressList = addressData.toJSON();
            contacts.push({
                firstName,
                lastName,
                address: addressList[3],
                avatar
            });
        }

        // Create entries for emails
        for (const emailData of emails) {
            const emailList = emailData.toJSON();
            contacts.push({
                firstName,
                lastName,
                address: emailList[3],
                avatar
            });
        }
    }

    return contacts;
};

export const sanitizeAddress = (text: string) => {
    if (text.includes("@")) return text;
    let output = text;
    output = output.replace(/\+1/g, ""); // Replace +1
    output = output.replace(/-/g, ""); // Replace dashes
    output = output.replace(/\(/g, ""); // Replace open parenthesis
    output = output.replace(/(\()|(\))/g, ""); // Replace open/close parenthesis
    output = output.replace("/ /g", ""); // Replace spaces
    return output.trim();
};
