function setTimeInRainEffect(){
    let date = new Date();
    let dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
     'Thursday', 'Friday', 'Saturday'][date.getDay()];
    let monthName = ["January", "February", "March", "April", "May", "June",
     "July", "August", "September", "October", "November", "December"][date.getMonth()];
    let text = dayName+', '+date.getDate()+' of '+monthName+' '+date.getFullYear();

    let els= document.getElementsByClassName("slide__element--date");
    [].forEach.call(els, function (el) {el.innerText = text});
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeInRainEffect();
 }, false);