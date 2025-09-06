


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



module.exports =  {  MsgType ,Roles, SortTypes , PeriodType };