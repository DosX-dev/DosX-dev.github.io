try {
  md5("");
} catch(e) {
  throw "This script requires the MD5 library"
}

function ultraHash(str, difficulty = 1, salt = "") {
    let mathprc = str, validator = "";
    for (var f = 0; f<((16*difficulty)+1); f++) { mathprc = md5(mathprc+salt); }
    for (var m = 0; m<256; m++) { validator += md5(mathprc+md5(difficulty+salt)+md5(mathprc[4])+(m<10 ? validator[m] : m + salt)); }
    mathprc = md5(validator[16] + validator[32]);
    return mathprc+(md5(mathprc+(salt+difficulty))+validator);
}
