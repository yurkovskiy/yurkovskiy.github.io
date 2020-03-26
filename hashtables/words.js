function countWords(sentence) {
    var result = {};
    var sentence_arr = sentence.split(" ");
    for (var i = 0; i < sentence_arr.length; i++) {
        if (result.hasOwnProperty(sentence_arr[i])) {
            result[sentence_arr[i]]++;
        }
        else {
            result[sentence_arr[i]] = 1;
        }
    }
    return result;
}


// countWords("This is a ball The ball is red")
/*
{
    "This": 1,
    "is": 2,
    "a": 1,
    "ball": 2,
    "The": 1,
    "red": 1
}
*/