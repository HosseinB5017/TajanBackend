function generateNumericCode(length) {
    let code = '';

    for (let i = 0; i < length; i++) {
        const digit = Math.floor(Math.random() * 10);
        code += digit.toString();
    }

    return code;
}

function generateAlphanumericCode(length) {
    // Define the characters that can be included in the code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';

    // Loop to generate the required number of characters
    for (let i = 0; i < length; i++) {
        // Generate a random index to select a character from the characters string
        const randomIndex = Math.floor(Math.random() * characters.length);
        // Append the selected character to the code string
        code += characters[randomIndex];
    }

    // Return the generated alphanumeric code
    return code;
}
module.exports = {generateNumericCode , generateAlphanumericCode}
