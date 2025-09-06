function validateEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
}

function validatePhoneNumber(phoneNumber) {
    const phoneRegex = /^09\d{9}$/;
    return phoneRegex.test(phoneNumber);
}
function validateOtp(otpCode) {
    const otpRegex = /^[0-9]{5}$/;
    return otpRegex.test(otpCode);
}

function validateInviteCode(inviteCOde) {
    const invitedRegex = /^[0-9]{7}$/;
    return invitedRegex.test(inviteCOde);
}



module.exports = {
    validateEmail,
    validatePhoneNumber,
    validateOtp,
    validateInviteCode
}