function calc(arr, elem) {
    var i, count = 0;
    if (arr.includes(elem)) {
        for (i = 0; i < arr.length; i++) {
            if (arr[i] == elem) {
                count++;
            }
        }
    }
    return count;
}