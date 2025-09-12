const prependBaseUrlToDocs = (jsonArray) => {
    const baseUrl = process.env.baseUrl || ""; // در صورت نبود مقدار
    return jsonArray.map(file => {
        return {
            ...file._doc, // اگر Mongoose Doc باشه
            url: `${baseUrl}${file.path}${file.name}`.replace(/\\/g, '/')
        };
    });
};

const prependBaseUrlToDoc = (json) => {

    var baseUrl = process.env.baseUrl;
    json.path = baseUrl + json.path + json.name;
    const finalPath = json.path.replace(/\\/g, '/')
    return finalPath;
};


const addLinksToFilePathList = (result) => {
    const baseUrl = process.env.baseUrl || '';

    if (!result || !Array.isArray(result.filePathList)) {
        return result; // اگر ساختار درست نبود، بدون تغییر برمی‌گردونه
    }

    const fileListWithLink = result.filePathList.map(file => ({
        ...file.toObject(),
        link: baseUrl + file.path + file.name
    }));

    return {
        ...result.toObject?.() || result, // در صورتی که result یک داکیومنت Mongoose باشه
        filePathList: fileListWithLink
    };
}


module.exports = {prependBaseUrlToDocs ,prependBaseUrlToDoc , addLinksToFilePathList}