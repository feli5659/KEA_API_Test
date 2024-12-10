const { google } = require("googleapis");

// Your spreadsheet ID from the URL
const SPREADSHEET_ID = "1R3CeKALSYKyMrVisx5LoTqzmVCe-Dz2qI0EBt-AULH0";
const RANGE = "DLP-Google-Ads-API!A2:G"; // Sheet name and range

// Initialize auth with service account credentials
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS),
  scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
});

exports.handler = async function (event, context) {
  try {
    // Get the keyword parameter from the URL, default to 'default' if not provided
    const keyword = event.queryStringParameters.keyword || "default";

    const sheets = google.sheets({ version: "v4", auth });

    // Fetch data from Google Sheets
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      throw new Error("No data found in spreadsheet");
    }

    // Find the row that matches the keyword
    // Assuming the keyword is in the first column
    const matchingRow = rows.find((row) => row[0]?.toLowerCase() === keyword.toLowerCase());

    if (!matchingRow) {
      // If no matching keyword found, use the first row as default
      matchingRow = rows[0];
    }

    // Map the spreadsheet columns to your content object
    const content = {
      subheading: matchingRow[1] || "",
      heading: matchingRow[2] || "",
      paragraph: matchingRow[3] || "",
      ctaSecondary: matchingRow[4] || "Learn More",
      ctaPrimary: matchingRow[5] || "Get Started",
      heroImage: matchingRow[6] || "default-hero.jpg",
    };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Enable CORS
      },
      body: JSON.stringify(content),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Failed to fetch content",
        details: error.message,
      }),
    };
  }
};
