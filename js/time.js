function setTimeInRainEffect(){
    let date = new Date();
    let dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
     'Thursday', 'Friday', 'Saturday'][date.getDay()];
    let monthName = ["January", "February", "March", "April", "May", "June",
     "July", "August", "September", "October", "November", "December"][date.getMonth()];
     
    $(".slide__element--date").
    text(dayName+', '+date.getDate()+' of '+monthName+' '+date.getFullYear());
}

setTimeInRainEffect();