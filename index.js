cetakPola(5);

function cetakPola(height) {
  for (let i = 0; i < height; i++) {
    let space = "";
    for (let j = 0; j < i; j++) {
      space += " ";
    }

    let symbol = "";
    if (i % 2 == 0) {
      for (let j = 0; j < height - i; j++) {
        if (j % 2 === 0) {
          symbol = symbol + "# ";
        } else {
          symbol = symbol + "+ ";
        }
      }
    } else {
      for (let j = 0; j < height - i; j++) {
        symbol = symbol + "+ ";
      }
    }

    console.log(space + symbol);
  }
}
