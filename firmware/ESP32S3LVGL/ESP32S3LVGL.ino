#include "secrets.h"
#include <SPI.h>
#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <Adafruit_Sensor.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <Arduino_GFX_Library.h>







#define GFX_BL DF_GFX_BL
#define TFT_BL 2

#if defined(DISPLAY_DEV_KIT)
Arduino_GFX *gfx = create_default_Arduino_GFX();
#else

Arduino_ESP32RGBPanel *bus = new Arduino_ESP32RGBPanel(
    40 /* DE */, 41 /* VSYNC */, 39 /* HSYNC */, 42 /* PCLK */,
    45 /* R0 */, 48 /* R1 */, 47 /* R2 */, 21 /* R3 */, 14 /* R4 */,
    5 /* G0 */, 6 /* G1 */, 7 /* G2 */, 15 /* G3 */, 16 /* G4 */, 4 /* G5 */,
    8 /* B0 */, 3 /* B1 */, 46 /* B2 */, 9 /* B3 */, 1 /* B4 */,
    0, 8, 4, 8, // horizontal polarity, front porch, pulse, back porch
    0, 8, 4, 8, // vertical polarity, front porch, pulse, back porch
    1, 16000000 // falling-edge pixel clock, 16 MHz
);
Arduino_RGB_Display *gfx = new Arduino_RGB_Display(800, 480, bus);
#endif /* !defined(DISPLAY_DEV_KIT) */

FirebaseData stream;
FirebaseAuth auth;
FirebaseConfig config;
String uid;
String databasePath;
// Database child nodes
String tempPath = "/temperature";
String humPath = "/humidity";
String timePath = "/timestamp";
String currentPath ="/current";
String PowerPath ="/power";
String VoltagePath = "/voltage";
String SensorPath = "board1/Sensor/" ;
unsigned long sendDataPrevMillis = 0;
String timestamp;

void initWiFi() {
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi ..........");
  while (WiFi.status() != WL_CONNECTED) 
  { 
    Serial.print('.'); 
    delay(500);
  }
  Serial.println(WiFi.localIP());
  Serial.println();
}

void streamTimeoutCallback(bool timeout)
{
  if (timeout)
    Serial.println("stream timeout, resuming...\n");
  if (!stream.httpConnected())
    Serial.printf("error code: %d, reason: %s\n\n", stream.httpCode(), stream.errorReason().c_str());
}
// Read the latest timestamp from the database
void gettime()
{
  if (Firebase.ready())
  {
    if (Firebase.RTDB.getInt(&stream, "/board1/Display/Time"))
    {timestamp = String(stream.intData());}
    else {Serial.println("Failed to get timestamp value");}
  }
  else{Serial.println("Firebase connection not ready");}
  return ;
}

void setup() 
{
  Serial.begin(115200);
  initWiFi();
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD ;
  config.database_url = DATABASE_URL ;
  /* Assign the callback function for the long running token generation task */
  stream.setResponseSize(4096);
  config.token_status_callback = tokenStatusCallback;
  config.max_token_generation_retry = 10;
  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
  Serial.println("Getting User UID");
  while ((auth.token.uid) == "") {
    Serial.print('.');
    delay(2000);
  }
  uid = auth.token.uid.c_str();
  gfx->begin();
  gfx->fillScreen(RGB565_BLACK);

#ifdef TFT_BL
    pinMode(TFT_BL, OUTPUT);
    digitalWrite(TFT_BL, HIGH);
#endif
    //gfx->setFont(&FreeMonoBoldOblique12pt7b);
    gfx->setCursor(100, 40);
    gfx->setTextColor(RGB565_WHITE);
    gfx->setTextSize(6,6,0);
    gfx->println("Icezaza Consumer");
    gfx->setTextSize(6,6,1);
    gfx->setTextColor(RGB565_WHITE);
    gfx->setCursor(120,160);
    gfx->println("Voltage");
    gfx->setCursor(600,160);
    gfx->println("V");
    gfx->setCursor(120,220);
    gfx->println("Current");
    gfx->setCursor(600,220);
    gfx->println("A");
    gfx->setCursor(120,280);
    gfx->println("Power");
    gfx->setCursor(600,280);
    gfx->println("W");
    gfx->setCursor(120,340);
    gfx->println("Temp");
    gfx->setCursor(600,340);
    gfx->println("C");
    gfx->setCursor(120,400);
    gfx->println("Humid");
    gfx->setCursor(600,400);
    gfx->println("%");

    gfx->drawRoundRect(100,140,560,320,20, RGB565_WHITE);
    delay(5000);
}

void loop() 
{
  if (Firebase.ready() && (millis() - sendDataPrevMillis > 15000 || sendDataPrevMillis == 0)) 
  {
    sendDataPrevMillis = millis();
    timestamp = "";
    gettime();
    if (timestamp.length() == 0) return;
    if (Firebase.RTDB.getString(&stream, SensorPath + String(timestamp) + "/voltage"))
    {
      if (stream.dataType() == "string") 
      {
        Serial.println("แรงดัน --> " + stream.stringData());
        gfx->writeFillRect(400,160,200,50,RGB565_BLACK);
        gfx->setCursor(400,160);
        gfx->setTextSize(5,5,1);
        gfx->setTextColor(RGB565_YELLOW);
        gfx->println(stream.stringData());
      }
    }
    else { Serial.println(stream.errorReason());}
    if (Firebase.RTDB.getString(&stream,SensorPath + String(timestamp) + "/current"))
      {
        if (stream.dataType() == "string") 
        {
          Serial.println("กระแส --> " + stream.stringData());
          gfx->writeFillRect(400,220,200,50,RGB565_BLACK);
          gfx->setCursor(400,220);
          gfx->setTextSize(5,5,1);
          gfx->setTextColor(RGB565_RED);
          
          gfx->println(stream.stringData());
        }
      }
    else { Serial.println(stream.errorReason());}
    if (Firebase.RTDB.getString(&stream, SensorPath+ String(timestamp) + "/power"))
      {
        if (stream.dataType() == "string") 
        {
          Serial.println("พลังงาน --> " + stream.stringData());
          gfx->writeFillRect(400,280,200,50,RGB565_BLACK);
          gfx->setCursor(400,280);
          gfx->setTextSize(5,5,1);
          gfx->setTextColor(RGB565_CYAN);
          gfx->println(stream.stringData());
        }
      }
    else { Serial.println(stream.errorReason());}
    if (Firebase.RTDB.getString(&stream, SensorPath + String(timestamp) + "/temperature"))
        {
          if (stream.dataType() == "string") 
          {
            Serial.println("อุณหภูมิ --> " + stream.stringData());
            gfx->writeFillRect(400,340,200,50,RGB565_BLACK);
            gfx->setCursor(400,340);
            gfx->setTextSize(5,5,1);
            gfx->setTextColor(RGB565_MAGENTA);
            gfx->println(stream.stringData());
          }
        }
    else { Serial.println(stream.errorReason());}
    if (Firebase.RTDB.getString(&stream, SensorPath + String(timestamp) + "/humidity"))
          {
            if (stream.dataType() == "string") 
            {
              Serial.println("ความชื้น --> " + stream.stringData());
              gfx->writeFillRect(400,400,200,50,RGB565_BLACK);
              gfx->setCursor(400,400);
              gfx->setTextSize(5,5,1);
              gfx->setTextColor(RGB565_GREEN);
              gfx->println(stream.stringData());
            }
          }
    else { Serial.println(stream.errorReason());}
  }
}