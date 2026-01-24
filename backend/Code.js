/**
 * Specialty Coffee Journal Backend
 */

function doGet(e) {
  if (!e || !e.parameter) {
    return ContentService.createTextOutput("Error: Run testConnection() instead.");
  }

  const action = e.parameter.action;
  let data;

  try {
    switch (action) {
      case 'getBeans':
        data = getSheetData('Beans');
        data = data.map(bean => ({
            ...bean,
            weight: Number(bean.weight || 0),
            price: Number(bean.price || 0),
            flavorNotes: safeJSONParse(bean.flavorNotes, [])
        }));
        break;
      case 'getPresets':
        data = getSheetData('Presets');
        data = data.map(p => ({
          ...p,
          clicks: Number(p.clicks || 0),
          temp: Number(p.temp || 0)
        }));
        break;
      case 'getHistory':
        data = getSheetData('Brews').reverse();
        data = data.map(h => ({
          ...h,
          clicks: Number(h.clicks || 0),
          waterTemp: Number(h.waterTemp || 0),
          calculatedCost: Number(h.calculatedCost || 0)
        }));
        break;
      case 'getCafeLogs':
        data = getSheetData('CafeLogs').reverse();
        data = data.map(log => ({
            ...log,
            price: Number(log.price || 0),
            flavorNotes: safeJSONParse(log.flavorNotes, [])
        }));
        break;
      default:
        throw new Error('Invalid action: ' + action);
    }
    return successResponse(data);
  } catch (err) {
    return errorResponse(err.toString());
  }
}

function doPost(e) {
  if (!e || !e.postData) return ContentService.createTextOutput("Error: No postData");

  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    switch (action) {
      case 'addBean':
        const beanId = Utilities.getUuid();
        const beanRow = [
          beanId,
          body.country || "",
          body.region || "",
          body.farm || "",
          body.variety || "",
          body.process || "",
          body.altitude || "",
          body.roaster || "",
          body.weight || 0,
          body.price || 0,
          body.purchaseDate || new Date().toISOString().split('T')[0],
          body.status || "Active",
          JSON.stringify(body.flavorNotes || [])
        ];
        appendRow('Beans', beanRow);
        return successResponse({ id: beanId });

      case 'updateBeanStatus':
        updateSheetRow('Beans', 'id', body.id, { 'status': body.status });
        return successResponse({ status: 'Updated' });

      case 'addPreset':
        const presetId = Utilities.getUuid();
        const presetRow = [
          presetId,
          body.recipeName,
          body.grinder,
          body.clicks,
          body.dripper,
          body.temp,
          body.pourSteps
        ];
        appendRow('Presets', presetRow);
        return successResponse({ id: presetId });

      case 'deletePreset':
        deleteSheetRow('Presets', 'id', body.id);
        return successResponse({ status: 'Deleted' });
        
      case 'addBrew':
        const brewId = Utilities.getUuid();
        const brewRow = [
          brewId,
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
        return successResponse({ id: brewId });

      case 'deleteBrew':
        deleteSheetRow('Brews', 'id', body.id);
        return successResponse({ status: 'Deleted' });

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
        return successResponse({ id: cafeId });
        
      default:
        throw new Error('Invalid action');
    }
  } catch (err) {
    return errorResponse(err.toString());
  }
}

function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) { setupHeaders(); sheet = ss.getSheetByName(sheetName); }
  const range = sheet.getDataRange();
  if (range.getLastRow() < 2) return [];
  const data = range.getValues();
  const rawHeaders = data.shift();
  const normalizedKeyMap = getNormalizedKeyMap();
  const headers = rawHeaders.map(h => {
    const clean = String(h).trim().toLowerCase();
    return normalizedKeyMap[clean] || clean;
  });
  return data.map(row => {
    let obj = {};
    headers.forEach((header, i) => { obj[header] = row[i]; });
    return obj;
  });
}

function updateSheetRow(sheetName, idColumn, idValue, updates) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift().map(h => h.toLowerCase().trim());
  const normalizedKeyMap = getNormalizedKeyMap();
  const mappedHeaders = headers.map(h => normalizedKeyMap[h] || h);
  const idIdx = mappedHeaders.indexOf(idColumn);
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][idIdx] === idValue) {
      for (let key in updates) {
        const colIdx = mappedHeaders.indexOf(key);
        if (colIdx !== -1) {
          sheet.getRange(i + 2, colIdx + 1).setValue(updates[key]);
        }
      }
      return true;
    }
  }
  return false;
}

function deleteSheetRow(sheetName, idColumn, idValue) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift().map(h => h.toLowerCase().trim());
  const normalizedKeyMap = getNormalizedKeyMap();
  const mappedHeaders = headers.map(h => normalizedKeyMap[h] || h);
  const idIdx = mappedHeaders.indexOf(idColumn);
  
  for (let i = 0; i < data.length; i++) {
    if (data[i][idIdx] === idValue) {
      sheet.deleteRow(i + 2);
      return true;
    }
  }
  return false;
}

function getNormalizedKeyMap() {
  return {
    'id': 'id',
    'country': 'country',
    'region': 'region',
    'farm': 'farm',
    'variety': 'variety',
    'process': 'process',
    'altitude': 'altitude',
    'roaster': 'roaster',
    'weight': 'weight',
    'price': 'price',
    'purchasedate': 'purchaseDate',
    'status': 'status',
    'flavornotes': 'flavorNotes',
    'date': 'date',
    'beanid': 'beanId',
    'recipename': 'recipeName',
    'grinder': 'grinder',
    'clicks': 'clicks',
    'dripper': 'dripper',
    'filtertype': 'filterType',
    'watertemp': 'waterTemp',
    'temp': 'temp',
    'poursteps': 'pourSteps',
    'totaltime': 'totalTime',
    'tastereview': 'tasteReview',
    'calculatedcost': 'calculatedCost',
    'cafename': 'cafeName',
    'beanname': 'beanName',
    'review': 'review'
  };
}

function appendRow(sheetName, rowData) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) { setupHeaders(); sheet = ss.getSheetByName(sheetName); }
  sheet.appendRow(rowData);
}

function safeJSONParse(str, fallback) {
  if (!str) return fallback;
  try { return JSON.parse(str); } catch (e) { return fallback; }
}

function successResponse(data) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'success', data: data })).setMimeType(ContentService.MimeType.JSON);
}

function errorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: message })).setMimeType(ContentService.MimeType.JSON);
}

function setupHeaders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const schemas = {
    'Beans': ['id', 'country', 'region', 'farm', 'variety', 'process', 'altitude', 'roaster', 'weight', 'price', 'purchaseDate', 'status', 'flavorNotes'],
    'Brews': ['id', 'date', 'beanId', 'recipeName', 'grinder', 'clicks', 'dripper', 'filterType', 'waterTemp', 'pourSteps', 'totalTime', 'tasteReview', 'calculatedCost'],
    'Presets': ['id', 'recipeName', 'grinder', 'clicks', 'dripper', 'temp', 'pourSteps'],
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
