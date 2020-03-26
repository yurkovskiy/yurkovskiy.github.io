function checkPG_13(age, accompanied) {
    if (age >= 13) {
        return true;
    }
    if ((age < 13) && (accompanied)) {
        return true;
    }
    else {
        return false;
    }
    
}