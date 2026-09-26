const MelipayamakApi = require('melipayamak');

const username = '09380403411';
const password = 'NL@G6';
const api = new MelipayamakApi(username,password);

const  OtpbodyId = '322678';
const  RegisterOrderForUserBodyId = '422817';
const  RecciveOrderForDriverBodyId = '422820';
const  RecciveOrderForAdminBodyId = '422820';
const  ChargeWalletForUserBodyId = '422830';
const  RegisterWithrawForUserBodyId = '422836';
const  ConfirmWithrawForUserBodyId = '422839';
const  RecciveWithrawForAdminBodyId = '422842';
const  RecciveOrderForShopBodyId = '543817';

const  driverNumber ='09105696394';
const  adminNumber = '09032176063';
const  paykNumber = '09928896946';

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

        sms.sendByBaseNumber(text, to, OtpbodyId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                console.log(error)
                reject(error);
            });
    });
}

function sendCreateOrderForUser( to, text = '') {
    return new Promise((resolve, reject) => {
        const api = new MelipayamakApi(username, password);
        const sms = api.sms();

        sms.sendByBaseNumber(text, to, RegisterOrderForUserBodyId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function RecciveOrderForAdmin(  text = '') {
    return new Promise((resolve, reject) => {
        const api = new MelipayamakApi(username, password);
        const sms = api.sms();

        sms.sendByBaseNumber(text, adminNumber, RecciveOrderForAdminBodyId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}

function RecciveOrderForShop(  text = '') {
    return new Promise((resolve, reject) => {
        const api = new MelipayamakApi(username, password);
        const sms = api.sms();

        sms.sendByBaseNumber(text, paykNumber, RecciveOrderForShopBodyId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}


function RecciveOrderForDriver(  text = '') {
    return new Promise((resolve, reject) => {
        const api = new MelipayamakApi(username, password);
        const sms = api.sms();

        sms.sendByBaseNumber(text, driverNumber, RecciveOrderForDriverBodyId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}


function ChargeWalletForUser( to, text = '') {
    return new Promise((resolve, reject) => {
        const api = new MelipayamakApi(username, password);
        const sms = api.sms();

        sms.sendByBaseNumber(text, to, ChargeWalletForUserBodyId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}


function WithdrawalForUser( to, text = '') {
    return new Promise((resolve, reject) => {
        const api = new MelipayamakApi(username, password);
        const sms = api.sms();

        sms.sendByBaseNumber(text, to, RegisterWithrawForUserBodyId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}


function WithdrawalConfirmationForUser( to, text = '') {
    return new Promise((resolve, reject) => {
        const api = new MelipayamakApi(username, password);
        const sms = api.sms();

        sms.sendByBaseNumber(text, to, ConfirmWithrawForUserBodyId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}


function RecciveWithdrawalForAdmin(  text = '') {
    return new Promise((resolve, reject) => {
        const api = new MelipayamakApi(username, password);
        const sms = api.sms();

        sms.sendByBaseNumber(text, adminNumber, RecciveWithrawForAdminBodyId)
            .then(response => {
                resolve(response);
            })
            .catch(error => {
                reject(error);
            });
    });
}
module.exports = {sendSMSToAdmin ,sendCreateOrderForUser, RecciveOrderForAdmin, RecciveOrderForDriver, RecciveOrderForShop, ChargeWalletForUser,WithdrawalForUser ,WithdrawalConfirmationForUser ,  RecciveWithdrawalForAdmin , sendOtp}