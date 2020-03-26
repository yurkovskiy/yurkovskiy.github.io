// 1...10, calculate sum of even numbers
// 2,4,6,8,10 => 30
// 1,3,5,7,9 => 25
// x % 2 == 0
var sum = 0;
var i;
for (i = 2; i <= 10; i = i + 2) {
    sum = sum + i;
}

console.log("sum = ", sum);


// i++ => i = i + 1;
// sum = sum + i => sum += i