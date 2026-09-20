


const SortTypes = {
    LATEST : "latest",
    OLDEST:"oldest",
    CHEAPEST:"cheapest",
    EXPENSIVE:"expensive",
    ALPHABETICALEN:"alphabeticalEn",
    ALPHABETICALFA:"alphabeticalFA",
    HIGHEST : 'highest',
    LOWEST : 'lowest'
}


// utils/dayMap.js
const dayMap = {
    0: "یکشنبه",
    1: "دوشنبه",
    2: "سه‌شنبه",
    3: "چهارشنبه",
    4: "پنج‌شنبه",
    5: "جمعه",
    6: "شنبه",
};



const PeriodType = {
    TODEY : 'todey' ,
    YESTERDAY :'yesterday',
    LASTMONTH :'lastMonth',
    LASTWEEK :'lastWeek',
    LASTYEAR:'lastYear',
    CUSTOM : 'custom'
}

const Roles = {
    ADMIN : 'admin',
    USER : 'user',
}

const MsgType = {
    txt : 'TXT',
    file : 'FILE'
}



const FileSection = {
    USERPROFILE : "userProfile",
    Waste : "waste",
    banner : "banner",
    product : "product",
    receipt : "receipt"
}


module.exports =  {dayMap ,  MsgType ,Roles, SortTypes , PeriodType ,FileSection };