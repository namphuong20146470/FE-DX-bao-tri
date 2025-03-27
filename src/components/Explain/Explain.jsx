import { useState } from "react";
import Mammoth from "mammoth";
import * as XLSX from "xlsx";
import * as pdfjs from "pdfjs-dist";
import "./Explain.css"
// Initialize pdfjs worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Renamed component to avoid conflict with the built-in FileReader class
export default function FileReaderApp() {
  const [total, setTotal] = useState(0);
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [skippedFiles, setSkippedFiles] = useState([]);

  const extractNumberAfterPhrase = (text, phrase) => {
    const lines = text.split('\n');
    let found = false;
    let extractedNumbers = [];

    for (let i = lines.length - 1; i >= 0; i--) {
      if (found) {
        const matches = lines[i].match(/\d{1,3}(?:[.,]\d{3})*/g);
        if (matches) {
          const number = parseInt(matches[matches.length - 1].replace(/[.,]/g, ''), 10);
          extractedNumbers.push(number);
        }
      }
      if (lines[i].includes(phrase)) {
        found = true;
      }
    }
    return extractedNumbers.length > 0 ? extractedNumbers[0] : 0;
  };

  // Advanced extraction for Excel files - checks for multiple phrases
  const extractNumbersFromExcel = (data) => {
    // Convert Excel data to searchable text
    const text = data.map(row => row.join(' ')).join('\n');

    // First try to find number after "Bằng chữ:"
    let value = extractNumberAfterPhrase(text, "Bằng chữ:");

    // If no value found, or value is 0, try looking for "total" related phrases
    if (value === 0) {
      // Extended list of phrases to check for totals
      const totalPhrases = [
        "total", "Total", "TOTAL",
        "tổng", "Tổng", "TỔNG",
        "total part", "Total Part", "TOTAL PART",
        "total price", "Total Price", "TOTAL PRICE",
        "total amount", "Total Amount", "TOTAL AMOUNT",
        "TOTAL PRICE PART I + II:",
        "TOTAL PRICE PART I + II",
        "TOTAL PRICE PART",
        "Grand Total", "GRAND TOTAL",
        "Sum", "SUM",
        "Tổng cộng", "TỔNG CỘNG",
        // Adding more Vietnamese phrases
        "tổng tiền", "Tổng tiền", "TỔNG TIỀN",
        "tổng giá", "Tổng giá", "TỔNG GIÁ",
        "TỔNG GIÁ PHẦN I + II:", "Tổng giá phần I + II:",
        "tổng cộng phần", "Tổng cộng phần", "TỔNG CỘNG PHẦN",
        "tổng cộng giá", "Tổng cộng giá", "TỔNG CỘNG GIÁ"
      ];

      for (const phrase of totalPhrases) {
        const extractedValue = extractNumberAfterPhrase(text, phrase);
        if (extractedValue > 0) {
          value = extractedValue;
          break;
        }
      }

      // Also search for cells with "total" and a number in the same row
      for (const row of data) {
        if (row && row.length > 1) {
          const rowText = row.join(' ').toLowerCase();
          if (rowText.includes('total') || rowText.includes('tổng') ||
            rowText.includes('part') || rowText.includes('price') ||
            rowText.includes('amount') || rowText.includes('sum') ||
            rowText.includes('cộng')) {
            const matches = rowText.match(/\d{1,3}(?:[.,]\d{3})*/g);
            if (matches) {
              const number = parseInt(matches[matches.length - 1].replace(/[.,]/g, ''), 10);
              if (!isNaN(number) && number > 0) {
                value = number;
                break;
              }
            }
          }
        }
      }
    }

    return value;
  };

  // Extract file version and base name
  const extractFileInfo = (filename) => {
    // First, try to match patterns like "16A." or "16B." or "16." at the beginning
    const versionRegex = /^(\d+)([A-Za-z])?[\s\.](.+)$/;
    const match = filename.match(versionRegex);

    if (match) {
      const number = match[1];
      const version = match[2] ? match[2].toUpperCase() : ''; // Empty string if no letter
      const restOfName = match[3];

      return {
        number,
        version,
        baseName: `${number}.${restOfName}`, // Base name without version letter
        fullName: filename
      };
    }

    return {
      number: null,
      version: null,
      baseName: filename,
      fullName: filename
    };
  };

  // Filter files to keep only the latest version
  const filterLatestVersions = (files) => {
    const fileGroups = {};
    const latestVersions = [];
    const skipped = [];

    // Group files by their base number
    files.forEach(file => {
      const fileInfo = extractFileInfo(file.name);

      // If we could extract a number
      if (fileInfo.number !== null) {
        const key = fileInfo.number;

        if (!fileGroups[key]) {
          fileGroups[key] = [];
        }

        fileGroups[key].push({
          file,
          version: fileInfo.version,
          info: fileInfo
        });
      } else {
        // Files that don't match our pattern are always included
        latestVersions.push(file);
      }
    });

    // For each group, find the latest version
    Object.keys(fileGroups).forEach(key => {
      const group = fileGroups[key];

      if (group.length > 1) {
        // FIXED SORTING LOGIC:
        // 1. Files with version letters are newer than files without
        // 2. For files with version letters, higher letters come first (C > B > A)
        group.sort((a, b) => {
          // If one has a version letter and the other doesn't
          if (a.version && !b.version) {
            return -1; // a (with letter) comes first (is newer)
          }
          if (!a.version && b.version) {
            return 1; // b (with letter) comes first (is newer)
          }

          // If both have version letters, compare them alphabetically
          if (a.version && b.version) {
            return b.version.localeCompare(a.version); // Sort in reverse (C > B > A)
          }

          // If neither has a version letter, maintain original order
          return 0;
        });

        // Keep the latest version
        latestVersions.push(group[0].file);

        // Add others to skipped list
        for (let i = 1; i < group.length; i++) {
          skipped.push({
            name: group[i].file.name,
            newerVersion: group[0].file.name
          });
        }
      } else if (group.length === 1) {
        // If there's only one file in the group, keep it
        latestVersions.push(group[0].file);
      }
    });

    return { latestVersions, skipped };
  };

  // Process DOCX files
  const processDocxFile = async (file, index) => {
    return new Promise((resolve, reject) => {
      const reader = new window.FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const result = await Mammoth.extractRawText({ arrayBuffer });
          const extractedNumber = extractNumberAfterPhrase(result.value, "Bằng chữ:");
          resolve({ file, value: extractedNumber, index });
        } catch (err) {
          reject({ file, error: err.message, index });
        }
      };
      reader.onerror = () => reject({ file, error: "File read error", index });
      reader.readAsArrayBuffer(file);
    });
  };

  // Process Excel files
  const processExcelFile = async (file, index) => {
    return new Promise((resolve, reject) => {
      const reader = new window.FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Use the enhanced extraction function for Excel
          const extractedNumber = extractNumbersFromExcel(data);
          resolve({ file, value: extractedNumber, index });
        } catch (err) {
          reject({ file, error: err.message, index });
        }
      };
      reader.onerror = () => reject({ file, error: "File read error", index });
      reader.readAsArrayBuffer(file);
    });
  };

  // Process PDF files
// Process PDF files (CHỈ BỎ QUA PDF, KHÔNG ĐỌC NỘI DUNG)
const processPdfFile = async (file, index) => {
  return new Promise((resolve) => {
    resolve({ file, value: "Bỏ qua PDF", index });
  });
};


  const handleFileUpload = async (event) => {
    const uploadedFiles = Array.from(event.target.files);
    setError("");
    setSkippedFiles([]);

    // Filter valid file types
    const validFiles = uploadedFiles.filter(file => {
      const name = file.name.toLowerCase();
      return name.endsWith('.docx') ||
        name.endsWith('.xlsx') ||
        name.endsWith('.xls') ||
        name.endsWith('.pdf');
    });

    if (uploadedFiles.length !== validFiles.length) {
      setError("Lưu ý: Chỉ các file DOCX, XLSX, XLS và PDF được xử lý.");
    }

    if (validFiles.length === 0) {
      setError("Không có file hợp lệ nào được chọn.");
      return;
    }

    // Filter to keep only the latest versions of each file
    const { latestVersions, skipped } = filterLatestVersions(validFiles);
    setSkippedFiles(skipped);

    if (skipped.length > 0) {
      setError(prev => {
        const msg = "Lưu ý: Một số file cũ hơn bị bỏ qua vì có phiên bản mới hơn.";
        return prev ? `${prev}\n${msg}` : msg;
      });
    }

    // Initialize files with no values yet
    const filesWithNoValues = latestVersions.map(file => ({
      file: { name: file.name },
      value: null,
      originalFile: file
    }));
    setFiles(filesWithNoValues);

    const promises = latestVersions.map((file, index) => {
      const name = file.name.toLowerCase();
      if (name.endsWith('.docx')) {
        return processDocxFile(file, index);
      } else if (name.endsWith('.xlsx') || name.endsWith('.xls')) {
        return processExcelFile(file, index);
      } else if (name.endsWith('.pdf')) {
        return processPdfFile(file, index);
      }
      return Promise.reject({ file, error: "Unsupported file type", index });
    });

    // Process all files and handle results
    Promise.allSettled(promises).then(results => {
      let newTotal = 0;
      const newFiles = [...filesWithNoValues];

      results.forEach(result => {
        if (result.status === 'fulfilled') {
          const { file, value, index } = result.value;
          if (!isNaN(value)) {
            newTotal += value;

            // Check if value is zero or suspiciously low (less than 100 VND)
            const isSuspiciouslyLow = value > 0 && value < 100;
            const isZero = value === 0;

            newFiles[index] = {
              file: { name: file.name },
              value,
              suspiciouslyLow: isSuspiciouslyLow,
              isZero: isZero, // Add a specific flag for zero values
              originalFile: file
            };
          }
        } else if (result.reason) {
          const { file, index } = result.reason;
          if (file && index !== undefined) {
            setError(prev => prev ? `${prev}\nLỗi khi đọc file: ${file.name}` : `Lỗi khi đọc file: ${file.name}`);
            newFiles[index] = {
              file: { name: file.name },
              error: true,
              originalFile: file
            };
          }
        }
      });

      setTotal(newTotal);
      setFiles(newFiles);
    });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-800">Tính Tổng Từ File DOCX, Excel và PDF</h1>
      <input
        type="file"
        multiple
        accept=".docx,.xlsx,.xls,.pdf"
        onChange={handleFileUpload}
        className="border p-3 rounded w-full bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {error && <p className="text-red-500 mt-3 whitespace-pre-line">{error}</p>}
      <p className="mt-4 text-lg font-semibold">
        Tổng số tiền: <span className="text-green-600 font-bold">{total.toLocaleString()} VND</span>
      </p>

      {files.length > 0 && (
        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-3 text-gray-700">Danh Sách File Đã Xử Lý ({files.length}):</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md">
              <thead>
                <tr className="bg-blue-600 text-white">
                  <th className="py-3 px-4 text-left text-sm font-semibold">STT</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Tên File</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Giá Trị (VND)</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {files.map((fileObj, index) => (
                  <tr
                    key={index}
                    className={`border-b ${
                      fileObj.error || fileObj.isZero || fileObj.suspiciouslyLow
                        ? 'bg-red-50 text-red-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="py-2 px-4 text-sm">{index + 1}</td>
                    <td className="py-2 px-4 text-sm">{fileObj.file?.name || "Unknown file"}</td>
                    <td className="py-2 px-4 text-sm">
                      {fileObj.value !== null ? fileObj.value.toLocaleString() : "N/A"}
                    </td>
                    <td className="py-2 px-4 text-sm">
                      {fileObj.error ? (
                        <span className="font-semibold">Lỗi đọc file</span>
                      ) : fileObj.isZero ? (
                        <span className="font-semibold">0 VND - Không tìm thấy giá trị</span>
                      ) : fileObj.suspiciouslyLow ? (
                        <span className="font-semibold">Giá trị quá nhỏ, có thể sai</span>
                      ) : (
                        <span className="text-green-600 font-semibold">Hợp lệ</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {skippedFiles.length > 0 && (
        <div className="mt-6 p-4 bg-gray-200 rounded-lg shadow-sm">
          <h2 className="font-semibold text-lg mb-3 text-gray-700">
            File Phiên Bản Cũ Bị Bỏ Qua ({skippedFiles.length}):
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-600 text-white">
                  <th className="py-3 px-4 text-left text-sm font-semibold">STT</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Tên File</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold">Phiên Bản Mới Hơn</th>
                </tr>
              </thead>
              <tbody>
                {skippedFiles.map((file, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4 text-sm">{index + 1}</td>
                    <td className="py-2 px-4 text-sm">{file.name}</td>
                    <td className="py-2 px-4 text-sm">{file.newerVersion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}