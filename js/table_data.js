let table_data = [];

/**
 * Sets the Stored Table Data
 * @param {string[][]} updatedTable
 */
const setTableData = (updatedTable) => {
  table_data = updatedTable;
};

/**
 * Returns the Stored Table Data
 * @returns {string[][]} the Table Data
 */
const getTableData = () => {
  return table_data;
};

/**
 * Generates a "Excel-Like" Column Label from a number
 * Eg. 2 => B, 27 => AA
 * @param {int} index
 * @returns an "Excel-Like" column label.
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
 * Calculates and returns a number based upon a "Excel-Like" Column Label
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
 * Creates an Empty Grid based upon the parameters
 * @param {int} numOfCols
 * @param {int} numOfRows
 * @returns an empty grid of size [numOfRows][numOfCols]
 */
const getEmptyGrid = (numOfRows, numOfCols) => {
  let data = [];
  for (let row = 0; row < numOfRows; row++) {
    const newCol = [];
    for (let col = 0; col < numOfCols; col++) {
      newCol.push("");
    }
    data.push(newCol);
  }
  return data;
};

/**
 * Generates the Table HTML element based upon the parameter provided
 * @param {string[][]} table - the data to be displayed
 * @returns a Table HTML element
 */
const generateGridElement = (table) => {
  const tableDiv = document.createElement("table");

  // Create Headers
  const headerDiv = document.createElement("tr");
  for (let col = 0; col <= table.length; col++) {
    const colLabel = indexToAlphabet(col);
    const textNode = document.createTextNode(colLabel);

    const tableHeader = document.createElement("th");
    tableHeader.appendChild(textNode);
    headerDiv.append(tableHeader);
  }
  tableDiv.append(headerDiv);

  // Create Table Data
  for (let row = 0; row < table.length; row++) {
    const tableRow = document.createElement("tr");

    // Create Row Label Column
    const rowHeader = document.createElement("th");
    const rowLabel = row + 1;
    const rowLabelNode = document.createTextNode(rowLabel);
    rowHeader.appendChild(rowLabelNode);
    tableRow.appendChild(rowHeader);

    // Add Row Data
    for (let col = 0; col < table[row].length; col++) {
      let data = table[row][col];
      const dataNode = document.createTextNode(data);

      const tableDataNode = document.createElement("td");
      tableDataNode.appendChild(dataNode);
      tableRow.appendChild(tableDataNode);
    }
    tableDiv.appendChild(tableRow);
  }

  return tableDiv;
};

const updateDisplay = (table) => {
  const tableElement = generateGridElement(table);
  document.getElementById("grid").appendChild(tableElement);
};

const setup = () => {
  const emptyTable = getEmptyGrid(100, 100);
  setTableData(emptyTable);

  const storedTable = getTableData();
  updateDisplay(storedTable);
};

window.addEventListener("load", setup);
