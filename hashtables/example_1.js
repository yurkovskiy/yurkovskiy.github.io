function countOddEvenDigits(number) {
    var result = {odd: 0, even: 0}
    var str = number.toString();
    for (var i = 0; i < str.length; i++) {
        if (Number(str[i]) % 2 == 0) {
            result.even++;
        }
        else {
            result.odd++;
        }
    }
    return result;
}


