cetakPola(5);

function cetakPola(height) {
  for (let i = 0; i < height; i++) {
    //ini umtuk bikin bentuk segitiganya rapih
    let space = "";
    for (let j = 0; j < i; j++) {
      space += " ";
    }

    //ini untuk segitiga kebawah dan kondisi
    let symbol = "";
    if (i % 2 == 0) {
      for (let k = i; k < height; k++) {
        if (k % 2 === 0) {
          symbol = symbol + "# ";
        } else {
          symbol = symbol + "+ ";
        }
      }
    } else {
      for (let m = i; m < height; m++) {
        symbol = symbol + "+ ";
      }
    }

    console.log(space + symbol);
  }
}
