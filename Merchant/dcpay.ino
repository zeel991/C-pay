#include <MCUFRIEND_kbv.h>
#include <Adafruit_GFX.h>
#include <qrcode.h>

MCUFRIEND_kbv tft;

const char *WALLET_ADDRESS = "0xf7262f8e06f569098b5dc5558cdefa3423313609ca8a200ce832de2841a57060";

#define QR_VERSION 5
#define QR_BUFFER_SIZE 172  // fixed for version 5
uint8_t qrcodeData[QR_BUFFER_SIZE];
QRCode qrcode;
void setup() {
  Serial.begin(9600);
  uint16_t ID = tft.readID();
  tft.begin(ID);
  tft.setRotation(1);
  tft.fillScreen(0xFFFF);
  Serial.println("Send amount (ex: 5) and I will make the QR.");
}

void loop() {
  if (Serial.available()) {
    String amount = Serial.readStringUntil('\n');
    amount.trim();
    if (amount.length() == 0) return;

    String json = "{\"ma\":\"";
    json += WALLET_ADDRESS;
    json += "\",\"a\":";
    json += amount;
    json += "}";

    Serial.print("Generating QR for: ");
    Serial.println(json);

    tft.fillScreen(0xFFFF);

    if (qrcode_initText(&qrcode, qrcodeData, QR_VERSION, 0, json.c_str()) != 0) {
      Serial.println("❌ QR code too big!");
      return;
    }

    int quietZone = 1;
    int totalModules = qrcode.size + 2 * quietZone;
    int scale = min(tft.width() / totalModules, tft.height() / totalModules);
    int qrSize = totalModules * scale;
    int xOffset = (tft.width() - qrSize) / 2;
    int yOffset = (tft.height() - qrSize) / 2;

    for (int y = 0; y < totalModules; y++) {
      for (int x = 0; x < totalModules; x++) {
        bool module = false;
        if (x >= quietZone && x < qrcode.size + quietZone &&
            y >= quietZone && y < qrcode.size + quietZone) {
          module = qrcode_getModule(&qrcode, x - quietZone, y - quietZone);
        }
        uint16_t color = module ? 0x0000 : 0xFFFF;
        tft.fillRect(xOffset + x * scale, yOffset + y * scale, scale, scale, color);
      }
    }
  }
}
