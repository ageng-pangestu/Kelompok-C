const letterArray = ["u", "D", "m", "w", "b", "a", "y", "s", "i", "s", "w", "a", "e", "s", "e", "o", "m", " ", " "];
const output = "Dumbways is awesome";
let hasil = "";

sortArray();
console.log(hasil);

function sortArray() {
  for (let i = 0; i < output.length; i++) {
    for (let j = i; j < letterArray.length; j++) {
      if (output.charAt(i) == letterArray[j]) {
        var charSwap = letterArray[i];
        letterArray[i] = letterArray[j];
        letterArray[j] = charSwap;
      }
    }
  }

  for (let k = 0; k < letterArray.length; k++) {
    hasil = hasil + letterArray[k];
  }
}
