var mark = Number(prompt("Enter the mark "));
var result = "";


    if (mark == 5) {
        result = "excelent";
    }
    else if (mark == 4) {
        result = "good";
    }
    else if (mark == 3) {
        result = "satisfactory";
    }
    else if (mark == 2) {
        result = "bad";
    }
    else {
        result = "wrong value";
    }


console.log(result);