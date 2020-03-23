function invokeAndAdd(a, b) {
    return a() + b();
}

console.log(invokeAndAdd(function(){ return 10}, function() {return 20}));
