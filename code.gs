// Updated Google Script code for OTP with Script Properties storage and logging

function doGet(e) {
  const action = e.parameter.action;
  const email = normalizeEmail(e.parameter.email);
  const otp = e.parameter.otp;

  if (action === 'sendOtp' && email) {
    return ContentService.createTextOutput(JSON.stringify(sendOtp(email)))
      .setMimeType(ContentService.MimeType.JSON);
  } else if (action === 'verifyOtp' && email && otp) {
    return ContentService.createTextOutput(JSON.stringify(verifyOtp(email, otp)))
      .setMimeType(ContentService.MimeType.JSON);
  } else if (action === 'getOrders' && email) {
    return ContentService.createTextOutput(JSON.stringify(getOrders(email)))
      .setMimeType(ContentService.MimeType.JSON);
  } else {
    return ContentService.createTextOutput(JSON.stringify({ success: false, message: 'Invalid action or missing parameters.' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getOrders(email) {
  const sheetId = 'YOUR_GOOGLE_SHEET_ID'; // TODO: Replace with your Google Sheet ID
  const sheetName = 'Orders'; // TODO: Replace with your sheet name
  try {
    const ss = SpreadsheetApp.openById(sheetId);
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      return { success: false, message: 'Orders sheet not found.' };
    }
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const orders = [];
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const orderEmail = row[headers.indexOf('Email')];
      if (orderEmail && normalizeEmail(orderEmail) === email) {
        const order = {};
        headers.forEach((header, index) => {
          order[header] = row[index];
        });
        orders.push(order);
      }
    }
    return { success: true, orders: orders };
  } catch (error) {
    return { success: false, message: 'Error fetching orders: ' + error.toString() };
  }
}

function sendOtp(email) {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate 6-digit OTP
  const expirationTime = Date.now() + (5 * 60 * 1000); // 5 minutes validity

  const scriptProperties = PropertiesService.getScriptProperties();
  scriptProperties.setProperty(email + '_otp', otp);
  scriptProperties.setProperty(email + '_otp_expiry', expirationTime.toString());

  Logger.log('sendOtp: Stored OTP for ' + email + ': ' + otp + ', expires at ' + expirationTime);

  // Image integration (same as before)
  var imageFileId = '13DfvSYgx5AK4JxCBgyBDWbmQB707qDiD';
  var imageBlob;
  try {
    imageBlob = DriveApp.getFileById(imageFileId).getBlob();
  } catch (e) {
    Logger.log('Error fetching image: ' + e.toString());
    return { success: false, message: 'Failed to retrieve logo image. Please check image ID and permissions.', error: e.toString() };
  }

  var inlineImages = {};
  var imageCID = 'store_logo_' + Date.now();
  inlineImages[imageCID] = imageBlob;

  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Your OTP for The JOYGURU BASANALAY Login',
      htmlBody: `
        <img src="cid:${imageCID}" alt="Store Logo" style="display: block; margin-left: auto; margin-right: auto; max-width: 200px; border-radius: 8px;">
        <p>Dear Customer,</p>
        <p>Your One-Time Password (OTP) for logging into The JOYGURU BASANALAY is:</p>
        <h3 style="color: #2e7d32; font-size: 24px; text-align: center; font-weight: bold; padding: 10px; background-color: #e8f5e9; border-radius: 5px;">${otp}</h3>
        <p>This OTP is valid for 5 minutes. Please do not share this with anyone.</p>
        <p>If you did not request this, please ignore this email.</p>
        <p>Thank you for choosing The JOYGURU BASANALAY!</p>
        <p>Best regards,<br>Joyguru Basanalay</p>`,
      inlineImages: inlineImages
    });
    return { success: true, message: 'OTP sent successfully.' };
  } catch (error) {
    Logger.log('Error sending email: ' + error.toString());
    return { success: false, message: 'Failed to send email. Please check the email address and script permissions.', error: error.toString() };
  }
}

function verifyOtp(email, otp) {
  const scriptProperties = PropertiesService.getScriptProperties();
  const storedOtp = scriptProperties.getProperty(email + '_otp');
  const storedExpiry = scriptProperties.getProperty(email + '_otp_expiry');
  const currentTime = Date.now();

  Logger.log('verifyOtp: Retrieved OTP for ' + email + ': ' + storedOtp + ', expiry: ' + storedExpiry);

  if (!storedOtp || !storedExpiry) {
    return { success: false, message: 'No OTP found for this email. Please send OTP first.' };
  }

  const expiryTimeMs = parseInt(storedExpiry);
  if (isNaN(expiryTimeMs) || currentTime > expiryTimeMs) {
    scriptProperties.deleteProperty(email + '_otp');
    scriptProperties.deleteProperty(email + '_otp_expiry');
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (otp === storedOtp) {
    scriptProperties.deleteProperty(email + '_otp');
    scriptProperties.deleteProperty(email + '_otp_expiry');
    return { success: true, message: 'OTP verified successfully.', token: 'loggedIn' };
  } else {
    return { success: false, message: 'Invalid OTP. Please try again.' };
  }
}
