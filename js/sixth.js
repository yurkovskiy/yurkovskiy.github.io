var mark = Number(prompt("Enter the mark "));
var result = "";

switch (mark) {
    case 5: {
        result = "excelent";
        break;
    }
    case 4: {
        result = "good";
        break;
    }
    case 3: {
        result = "satisfactory";
        break;
    }
    case 2: {
        result = "bad";
        break;
    }
    default: {
        result = "wrong value";
    }
}

console.log(result);