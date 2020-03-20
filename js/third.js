// 1...10, calculate sum of even numbers
// 2,4,6,8,10 => 30
// 1,3,5,7,9 => 25
// x % 2 == 0
var sum = 0;
var i = 1;

while (i <= 10) {
    if (i % 2 == 0) {
        sum += i;
    }
    i++;
}

console.log("sum = ", sum);


// i++ => i = i + 1;
// sum = sum + i => sum += i