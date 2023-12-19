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
 * Sets the Cell at the specified row and col with the specified data
 * @param {int} row
 * @param {int} col
 * @param {string} data
 */
const setTableCell = (row, col, data) => {
  const table = getTableData();
  table[row][col] = data;
  setTableData(table);
  updateDisplay(table);
};

/**
 * Retrieves cell data from the row and col specified
 * @param {int} row
 * @param {int} col
 * @returns {string}
 */
const getTableCell = (row, col) => {
  const table = getTableData();
  const data = table[row][col];
  return data;
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
  let capitalLetters = letters.toUpperCase();
  let index = 0;
  for (var i = 0; i < capitalLetters.length; i++) {
    const currentLetter = capitalLetters.charAt(i);
    const letterNumber = currentLetter.charCodeAt() - 64; // 65 is 'A'
    index = index * 26 + letterNumber;
  }
  return index;
};

/**
 * Gets Cell Data from Cell Number (eg. A12)
 * @param {string} cellNum a string in the Excel Cell Format (eg. A12)
 * @returns {string | null} the value of the cell specified from the parameter, or null if the cell number was invalid
 */
const getCellDataFromCellNumber = (cellNum) => {
  // Parse Cell Number
  let letterNumberSplitIndex = cellNum.search(/[1-9]/);
  const letters = cellNum.substring(0, letterNumberSplitIndex);
  const numbers = cellNum.substring(letterNumberSplitIndex);

  // Get Cell Data
  try {
    const row = alphabetToIndex(letters); // Might return if letters are not valid (let through by regex)
    const col = Number.parseInt(numbers);

    if (Number.parseInt(numbers) == NaN) {
      return null;
    }

    const cellData = getTableCell(row - 1, col - 1); //-1 to account for array indexing
    return cellData;
  } catch (error) {
    console.log(error);
    return null;
  }
};

/**
 * Parses the Cell Data for Table Display. If it is a function (denoted by =), then the value of that function is calculated
 * @param {string} data
 * @returns {string} the calculated cell value if it is a function, otherwise the cell data
 */
const parseData = (data) => {
  if (data == "") {
    return "";
  }
  if (data.charAt(0) != "=") {
    return data;
  }

  // At this point, data must be a formula and must be parsed
  // NOTE: This uses Function(), which is only used given that this for a small project with no actual saving.
  // If actual data is being stored or this is being deployed, this code must be rewritten.
  // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval#never_use_eval!
  let parsedFunction = data.slice(1); // Remove equals sign
  const dataSections = parsedFunction.split(/\+|\-|\*|\/|\(|\)/);

  for (let i = 0; i < dataSections.length; i++) {
    let section = dataSections[i];
    const dataAtCell = getCellDataFromCellNumber(section);
    if ((dataAtCell == null) | (Number.parseFloat(dataAtCell) == NaN)) {
      return "Error";
    }

    // Replace the parsedValue in the data string
    parsedFunction = parsedFunction.replace(section, dataAtCell);
  }

  // Return Back Calculated Data using UNSAFE method
  const calculateUnsafe = (fn) => {
    return new Function("return " + fn)();
  };
  return calculateUnsafe(parsedFunction);
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

const tableEdit = (row, col, originalContent) => {
  const promptText =
    "Enter your new data (previous value: " + originalContent + ")";
  let response = prompt(promptText, originalContent);
  if (response != null) {
    setTableCell(row, col, response);
  }
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
      let parsedData = parseData(data);
      const dataNode = document.createTextNode(parsedData);

      const tableDataNode = document.createElement("td");

      // Add Listener for Node Edit
      tableDataNode.addEventListener("click", () => tableEdit(row, col, data));

      tableDataNode.appendChild(dataNode);
      tableRow.appendChild(tableDataNode);
    }
    tableDiv.appendChild(tableRow);
  }

  return tableDiv;
};

const updateDisplay = (table) => {
  const tableElement = generateGridElement(table);
  const grid = document.getElementById("grid");
  grid.replaceChildren(); // Remove previous displays generated
  grid.appendChild(tableElement);
};

const setup = () => {
  const emptyTable = getEmptyGrid(100, 100);
  setTableData(emptyTable);

  const storedTable = getTableData();
  updateDisplay(storedTable);
};

window.addEventListener("load", setup);
