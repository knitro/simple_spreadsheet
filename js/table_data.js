let table_data = [];
let cyclic_check = [];

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
 * Retrieves cell data from the row and col specified and parses if possible
 * @param {int} row
 * @param {int} col
 * @returns {string} the table cell, or "CYCLIC ERROR" if a cyclic error has been found
 */
const getTableCell = (row, col) => {
  const table = getTableData();
  const data = table[row][col];

  // Check for Cyclic
  const valueCheck = row + "-" + col;
  if (cyclic_check.includes(valueCheck)) {
    return "CYCLIC ERROR";
  }
  cyclic_check.push(valueCheck);

  const parsedData = parseData(data);
  cyclic_check.pop();
  return parsedData;
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
  if (letters == null) {
    return null;
  }
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
 * Gets the Cell Letter and Number from a cell reference string.
 * Note this DOES NOT check for existence of the cell reference, but rather splits where it should.
 * @param {string} cellRef
 * @returns {{string, string} | null} the Cell letters and number, or null if not valid
 */
const getCellLettersAndNumbers = (cellRef) => {
  // Parse Cell Number
  let letterNumberSplitIndex = cellRef.search(/[1-9]/);

  const letters = cellRef.substring(0, letterNumberSplitIndex);
  const numbers = cellRef.substring(letterNumberSplitIndex);

  const numbersParsed = Number.parseInt(numbers);
  if (Number.isNaN(numbersParsed)) {
    return null;
  }

  return { letters, numbers };
};

/**
 * Gets Cell Data from Cell Reference (eg. A12)
 * @param {string} cellRef a string in the Excel Cell Format (eg. A12)
 * @returns {string | null} the value of the cell specified from the parameter, or null if the cell reference was invalid
 */
const getCellDataFromCellReference = (cellRef) => {
  // Parse Cell Number
  const { letters, numbers } = getCellLettersAndNumbers(cellRef);
  // Get Cell Data
  try {
    const col = alphabetToIndex(letters); // Might return if letters are not valid (let through by regex)
    const row = Number.parseInt(numbers);

    if (Number.isNaN(Number.parseInt(numbers))) {
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

  // Parsing for sum()
  // NOTE: This parsing is for the format of sum([cell]:[cell]) where [cell] is a valid cell number
  const sumRegex = /sum\(.+\)/gi;
  const matchesForSum = parsedFunction.match(sumRegex);
  if (matchesForSum != null) {
    matchesForSum.forEach((match) => {
      // Remove extra characters
      const regex = /(sum)|\(|\)/gi;
      let cleanedMatch = match.replaceAll(regex, "");
      let cells = cleanedMatch.split(":");
      if (cells.length != 2) {
        return "Cell Error";
      }

      // Calculate the Sum
      const { letters: startLetter, numbers: startNum } =
        getCellLettersAndNumbers(cells[0]);
      const { letters: endLetter, numbers: endNum } = getCellLettersAndNumbers(
        cells[1]
      );

      const minRow = Math.min(
        Number.parseInt(startNum),
        Number.parseInt(endNum)
      );
      const maxRow = Math.max(
        Number.parseInt(startNum),
        Number.parseInt(endNum)
      );
      const minCol = Math.min(
        alphabetToIndex(startLetter),
        alphabetToIndex(endLetter)
      );
      const maxCol = Math.max(
        alphabetToIndex(startLetter),
        alphabetToIndex(endLetter)
      );

      let sum = 0;
      for (let row = minRow; row <= maxRow; row++) {
        for (let col = minCol; col <= maxCol; col++) {
          const cellData = getTableCell(row - 1, col - 1); //-1 to account for array indexing
          if (cellData == "CYCLIC ERROR") {
            return "CYCLIC ERROR";
          }
          const cellDataNumber = Number.parseFloat(cellData);
          if (Number.isNaN(cellDataNumber)) {
            return "SUM NaN";
          }
          sum += cellDataNumber;
        }
      }

      // Replace the parsedValue in the data string
      parsedFunction = parsedFunction.replace(match, sum);
    });
  }

  // Parsing for +, -, *, /
  const dataSections = parsedFunction.split(/\+|\-|\*|\/|\(|\)/);

  for (let i = 0; i < dataSections.length; i++) {
    let section = dataSections[i];

    // Continue if section is already number (not a cell number)
    const checkIfNumber = Number.parseFloat(section);
    if (!Number.isNaN(checkIfNumber)) {
      continue;
    }
    const dataAtCell = getCellDataFromCellReference(section);
    if (dataAtCell == null) {
      return "CALC ERROR";
    } else if (dataAtCell == "CYCLIC ERROR") {
      return "CYCLIC ERROR";
    } else if (Number.isNaN(Number.parseFloat(dataAtCell))) {
      return "NaN";
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

/**
 *
 * @param {*} row
 * @param {*} col
 * @param {*} originalContent
 */
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
      const parsedData = parseData(data);
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
