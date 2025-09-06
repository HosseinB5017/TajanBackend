const MelipayamakApi = require('melipayamak');

const username = '09380403411';
const password = 'NL@G6';
const api = new MelipayamakApi(username,password);

const  bodyId = '322678';
 async function sendSMSToAdmin(msg ) {
        try {

        } catch (error) {
            throw error;
        }
}
function sendOtp( to, text = '') {
    return new Promise((resolve, reject) => {
        const api = new MelipayamakApi(username, password);
        const sms = api.sms();

        sms.sendByBaseNumber(text, to, bodyId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}

module.exports = {sendSMSToAdmin , sendOtp}