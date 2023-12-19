let table_data = [];

/**
 *
 * @param {string[][]} updatedTable
 */
const setTableData = (updatedTable) => {
  table_data = updatedTable;
};

/**
 *
 * @returns {string[][]}
 */
const getTableData = () => {
  return table_data;
};

/**
 *
 * @param {int} i
 * @returns
 */
const getCharForNumber = (i) => {
  return i > 0 && i < 27 ? String.valueOf(char(i + "A" - 1)) : null;
};

/**
 *
 * @param {int} index
 * @returns
 */
const indexToAlphabet = (index) => {
  if (index == 0) {
    return "";
  }

  // We consider A = 0, Z = 25 for Base 26, hence subtract 1 to account for this.
  const adjustedIndex = index - 1;

  let getLetters = (value) => {
    let factor = Math.floor(value / 26);
    // Recurse if factor is greater than base
    let prefix = factor > 0 ? getLetters(factor - 1) : "";

    let remainder = value % 26;
    let remainderLetter = String.fromCharCode(65 + remainder);
    return prefix + remainderLetter;
  };

  const letters = getLetters(adjustedIndex);
  return letters;
};

/**
 *
 * @param {string} letters
 * @returns
 */
const alphabetToIndex = (letters) => {
  let index = 0;
  for (var i = 0; i < letters.length; i++) {
    const currentLetter = letters.charAt(i);
    const letterNumber = currentLetter.charCodeAt() - 64; // 65 is 'A'
    index = index * 26 + letterNumber;
  }
  console.log("Letter: " + letter + " to " + index);
  return index;
};

/**
 *
 * @param {int} numOfCols
 * @param {int} numOfRows
 * @returns
 */
const getEmptyGrid = (numOfCols, numOfRows) => {
  let data = [];
  for (let col = 0; col < numOfCols; col++) {
    const newRow = [];
    for (let row = 0; row < numOfRows; row++) {
      newRow.push("");
    }
    data.push(newRow);
  }
  return data;
};

/**
 *
 * @param {string[][]} table
 * @returns
 */
const generateGridHtml = (table) => {
  let html = "<table>";

  // Create Headers
  html += "<tr>";
  for (let col = 0; col <= table.length; col++) {
    const colLabel = indexToAlphabet(col);
    html += "<th>" + colLabel + "</th>";
  }
  html += "</tr>";

  // Create Table Data
  for (let row = 0; row < table.length; row++) {
    // Create Row Label Column
    const rowLabel = row + 1;
    html += "<tr><th>" + rowLabel + "</th>";

    // Add Row Data
    for (let col = 0; col < table[row].length; col++) {
      let data = table[row][col];
      html += "<td>" + data + "</td>";
    }

    html += "</tr>";
  }

  html += "</table>";
  return html;
};

const updateDisplay = (table) => {
  const tableHtml = generateGridHtml(table);
  document.getElementById("grid").innerHTML = tableHtml;
};

const setup = () => {
  const emptyTable = getEmptyGrid(100, 100);
  setTableData(emptyTable);

  const storedTable = getTableData();
  updateDisplay(storedTable);
};

window.addEventListener("load", setup);
