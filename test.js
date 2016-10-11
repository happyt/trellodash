var weekOfYear = function(date){
    var d = new Date(+date);
    d.setHours(0,0,0);
    d.setDate(d.getDate()+4-(d.getDay()||7));
    console.log(d);
    return Math.ceil((((d-new Date(d.getFullYear(),0,1))/8.64e7)+1)/7);
};


// Returns the ISO week of the date.
var getWeek = function(ddd) {
  var date = new Date(+ddd);
   date.setHours(0, 0, 0, 0);
  // Thursday in current week decides the year.
  date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
  // January 4 is always in week 1.
  var week1 = new Date(date.getFullYear(), 0, 4);
  // Adjust to Thursday in week 1 and count number of weeks from date to week1.
  // 86400000 millisecs/day
  return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000
                        - 3 + (week1.getDay() + 6) % 7) / 7);
}

// month starts from zero, day from 1
var dy = 2016;
var dm = 9;
var dd = 9;

var dt = new Date(dy, dm, dd);
var week =  weekOfYear(dt);
var isoweek =  getWeek(dt);
console.log(week, isoweek);

