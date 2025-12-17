/**
 * Specialty Coffee Journal Backend
 * 
 * INSTRUCTIONS:
 * 1. Create a new Google Sheet.
 * 2. Create tabs named: 'Beans', 'Brews', 'Presets', 'CafeLogs'.
 * 3. In the Script Editor, paste this code.
 * 4. Deploy as Web App -> Execute as: Me -> Who has access: Anyone.
 * 5. Copy the URL and paste it into `constants.ts` in the frontend.
 */

function doGet(e) {
  const action = e.parameter.action;
  let data;

  try {
    switch (action) {
      case 'getBeans':
        data = getSheetData('Beans');
        // Parse flavorNotes JSON string back to array
        data = data.map(bean => ({
            ...bean,
            flavorNotes: safeJSONParse(bean.flavorNotes, [])
        }));
        break;
      case 'getPresets':
        data = getSheetData('Presets');
        break;
      case 'getHistory':
        data = getSheetData('Brews').reverse(); // Newest first
        break;
      case 'getCafeLogs':
        data = getSheetData('CafeLogs').reverse();
        data = data.map(log => ({
            ...log,
            flavorNotes: safeJSONParse(log.flavorNotes, [])
        }));
        break;
      default:
        throw new Error('Invalid action');
    }
    return successResponse(data);
  } catch (err) {
    return errorResponse(err.toString());
  }
}

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    
    switch (action) {
      case 'addBean':
        // Generate ID
        const beanId = Utilities.getUuid();
        const beanRow = [
          beanId,
          body.country,
          body.region,
          body.farm,
          body.variety,
          body.process,
          body.altitude,
          body.roaster,
          body.weight,
          body.price,
          body.purchaseDate,
          body.status,
          JSON.stringify(body.flavorNotes)
        ];
        appendRow('Beans', beanRow);
        return successResponse({ id: beanId });
        
      case 'addBrew':
        const brewRow = [
          body.date,
          body.beanId,
          body.recipeName,
          body.grinder,
          body.clicks,
          body.dripper,
          body.filterType,
          body.waterTemp,
          body.pourSteps,
          body.totalTime,
          body.tasteReview,
          body.calculatedCost
        ];
        appendRow('Brews', brewRow);
        return successResponse({ status: 'Logged' });

      case 'addCafe':
        const cafeId = Utilities.getUuid();
        const cafeRow = [
          cafeId,
          body.date,
          body.cafeName,
          body.beanName,
          body.price,
          body.review,
          JSON.stringify(body.flavorNotes || [])
        ];
        appendRow('CafeLogs', cafeRow);
        return successResponse({ status: 'Logged', id: cafeId });
        
      default:
        throw new Error('Invalid action');
    }
  } catch (err) {
    return errorResponse(err.toString());
  }
}

// --- Helpers ---

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift(); // Remove headers
  
  return data.map(row => {
    let obj = {};
    headers.forEach((header, i) => {
       // Convert camelCase headers assumed in row
       obj[header] = row[i];
    });
    return obj;
  });
}

function appendRow(sheetName, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  sheet.appendRow(rowData);
}

function safeJSONParse(str, fallback) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

function successResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'error',
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this once to setup sheet headers if they don't exist
 */
function setupHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const schemas = {
    'Beans': ['id', 'country', 'region', 'farm', 'variety', 'process', 'altitude', 'roaster', 'weight', 'price', 'purchaseDate', 'status', 'flavorNotes'],
    'Brews': ['date', 'beanId', 'recipeName', 'grinder', 'clicks', 'dripper', 'filterType', 'waterTemp', 'pourSteps', 'totalTime', 'tasteReview', 'calculatedCost'],
    'Presets': ['recipeName', 'grinder', 'clicks', 'dripper', 'temp', 'pourSteps'],
    'CafeLogs': ['id', 'date', 'cafeName', 'beanName', 'price', 'review', 'flavorNotes']
  };

  for (let [name, headers] of Object.entries(schemas)) {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      sheet.appendRow(headers);
    }
  }
}