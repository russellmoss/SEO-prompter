import * as XLSX from 'xlsx';
import { ExcelRow } from './types';

export class ExcelParser {
  /**
   * Converts a column number to Excel-style column reference (A, B, ..., Z, AA, AB, etc.)
   * @param columnNumber The column number (0-based)
   * @returns string The Excel-style column reference
   */
  private static getColumnLetter(columnNumber: number): string {
    let columnLetter = '';
    while (columnNumber >= 0) {
      columnLetter = String.fromCharCode(65 + (columnNumber % 26)) + columnLetter;
      columnNumber = Math.floor(columnNumber / 26) - 1;
    }
    return columnLetter;
  }

  /**
   * Parses an Excel file and returns an array of ExcelRow objects.
   * @param file The Excel file to parse
   * @returns Promise<ExcelRow[]>
   */
  static async parseFile(file: File): Promise<any[]> {
    try {
      console.log('Reading Excel file...');
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      
      // Get the first sheet
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!firstSheet) {
        throw new Error('No sheets found in the Excel file');
      }

      // Convert to JSON
      const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
      console.log('Excel data:', data);

      if (!data || data.length < 2) {
        throw new Error('Excel file must have at least a header row and one data row');
      }

      // Get headers (first row)
      const headers = data[0] as string[];
      console.log('Headers:', headers);

      // Process data rows
      const rows = data.slice(1).map((row: any) => {
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          // Convert column index to Excel-style column reference
          const columnLetter = this.getColumnLetter(index);
          const value = row[index];
          rowData[columnLetter] = value ? String(value) : '';
        });
        return rowData;
      });

      console.log('Processed rows:', rows);
      return rows;
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      throw error;
    }
  }

  /**
   * Parses a comma-delimited string into an array of trimmed, non-empty strings.
   * @param value The string to parse
   * @returns string[]
   */
  static parseDelimitedField(value: string): string[] {
    if (!value) return [];
    return value.split(',').map(item => item.trim()).filter(Boolean);
  }

  /**
   * Joins an array of strings into a single comma-separated string.
   * @param arr The array to join
   * @returns string
   */
  static formatArrayAsString(arr: string[]): string {
    return arr.join(', ');
  }
} 