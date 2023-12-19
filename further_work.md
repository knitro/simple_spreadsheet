# Further Work

- To do Italics/Bold/Underline, the code will need to have the following changes

  - Change the table_data array to store objects of the following type

    ```ts
    interface TableData {
      data: string;
      italics: boolean;
      bold: boolean;
      underline: boolean;
    }
    ```

  - Add a UI change to allow for italics, bold and underline toggles to appear.
    - This can be done through changing the prompt to a dialog.
      - This dialog would have all the button toggles and the data entry text field.

- Adjust getCellDataFromCellReference() to not be able to return {null, null} and instead just null
  - This will mean adjusting all the deconstructed object references to avoid null issues there.
