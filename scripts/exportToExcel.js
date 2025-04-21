import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export const exportToExcel = async (data, selectedMonth, selectedYear) => {
  try {
    // ✅ Format month & year dynamically
    const formattedMonth = selectedMonth.padStart(2, '0'); // Ensures "4" → "04"
    const formattedYear = selectedYear.slice(-2); // Extracts last two digits ("2025" → "25")
    const fileName = `MonthlySummary${formattedMonth}-${formattedYear}.xlsx`;

    // ✅ Create Workbook & Worksheet
    const workbook = XLSX.utils.book_new();
    const worksheetData = [
      ["Customer Name", "Buffalo Milk (L)", "Buffalo Rate (₹/L)", "Buffalo Total (₹)", "Cow Milk (L)", "Cow Rate (₹/L)", "Cow Total (₹)", "Grand Total (₹)"],
      ...data.map(({ customer_name, buffaloMilk, buffaloRate, buffaloTotal, cowMilk, cowRate, cowTotal, grandTotal }) => [
        customer_name,
        buffaloMilk,
        { v: buffaloRate, t: 'n', z: '₹0.00' }, // ✅ Format currency properly
        { v: buffaloTotal, t: 'n', z: '₹0.00' },
        cowMilk,
        { v: cowRate, t: 'n', z: '₹0.00' },
        { v: cowTotal, t: 'n', z: '₹0.00' },
        { v: grandTotal, t: 'n', z: '₹0.00' }
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // ✅ Apply Bold Headers & Column Widths
    worksheet['!cols'] = [
      { wch: 20 }, // Customer Name Column
      { wch: 15 }, // Buffalo Milk
      { wch: 15 }, // Buffalo Rate
      { wch: 20 }, // Buffalo Total
      { wch: 15 }, // Cow Milk
      { wch: 15 }, // Cow Rate
      { wch: 20 }, // Cow Total
      { wch: 20 }, // Grand Total
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Summary");

    // ✅ Convert Workbook to Binary & Save
    const excelBinary = XLSX.write(workbook, { type: "base64" });
    const fileUri = FileSystem.documentDirectory + fileName;

    await FileSystem.writeAsStringAsync(fileUri, excelBinary, { encoding: FileSystem.EncodingType.Base64 });

    // ✅ Share Excel File
    await Sharing.shareAsync(fileUri, {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      dialogTitle: "Share Monthly Summary",
      UTI: "com.microsoft.excel.xlsx"
    });

  } catch (error) {
    console.error("Excel Export Error:", error);
  }
};
