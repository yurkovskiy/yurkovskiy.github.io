function generateFibonacciSequence(n) {
    var fibo = [1, 1];

    for (var i = 2; i < n; i++) {
        fibo.push(fibo[i - 1] + fibo[i - 2]); // fibo[i] = fibo[i - 1] + fibo[i - 2]
    }
    return fibo;
}


console.log(generateFibonacciSequence(5)); // [1, 1, 2, 3, 5]
console.log(generateFibonacciSequence(10)); // [1, 1, 2, 3, 5, 8, 13, 21, 34, 55]


