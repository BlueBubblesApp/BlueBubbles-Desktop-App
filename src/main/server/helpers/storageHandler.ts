

export const getStorageInformation = () => {
    const totalAppSize = 245; //Get from fs base folder of bluebubbles app (TODO)
    const attachmentFolderSize = 114; //Get using fs
    const baseAppSize = 68; //Get from fs
    const textDataSize = totalAppSize - (attachmentFolderSize + baseAppSize);
    
    const storageInfo = [{
        "totalAppSizeMB": totalAppSize
    }, {
        "baseAppSizeMB": baseAppSize,
        "baseAppSizePercent": Math.round(((baseAppSize/totalAppSize) + Number.EPSILON) * 100) / 100
    }, {
        "textDataSizeMB": textDataSize,
        "textDataSizePercent": Math.round(((textDataSize/totalAppSize) + Number.EPSILON) * 100) / 100
    }, {
        "attachmentFolderSizeMB": attachmentFolderSize,
        "attachmentFolderSizePercent": Math.round(((attachmentFolderSize/totalAppSize) + Number.EPSILON) * 100) / 100 //Divide total app size by attachment size to get % attachments and round to 2 decimals
    }]
    
    return (storageInfo);
};