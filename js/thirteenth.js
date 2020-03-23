function min(arr) {
    var m = arr[0];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > m) {
            m = arr[i];
        }
    }
    return m;
}

console.log(min([-6, 10, 20, 30, -1, 22, -2, 10, 20, 44, 1, -4, 2, 5, 6, 9, 10, 12]));