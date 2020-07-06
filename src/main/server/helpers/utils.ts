export const mergeUint8Arrays = (first: Uint8Array, second: Uint8Array) => {
    const temp = new Uint8Array(first.byteLength + second.byteLength);
    temp.set(first, 0);
    temp.set(second, first.byteLength);
    return temp;
};
