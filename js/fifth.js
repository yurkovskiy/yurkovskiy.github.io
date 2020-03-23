var i = 0;
var sum = 0;

while (i < 10) {
    i++;
    if (i == 6) {
        continue;
    }
    sum += i;
}

console.log("sum = ", sum);