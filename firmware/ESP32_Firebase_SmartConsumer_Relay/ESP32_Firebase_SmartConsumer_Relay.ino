#include "secrets.h"
#include <Arduino.h>
#include <Wire.h>
#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <Adafruit_Sensor.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"






FirebaseData stream;
FirebaseAuth auth;
FirebaseConfig config;
String uid;
String listenerPath = "board1/outputs/digital/";
String tempPath = "/temperature";
String humPath = "/humidity";
String timePath = "/timestamp";
String SensorPath = "board1/Sensor/" ;
unsigned long count = 0;
unsigned long sendDataPrevMillis = 0;
const int16_t  DELAY_BETWEEN_RESTARTS = 5000;
const uint8_t MAX_RESTART_ATTEMPTS = 5;
int restartCount = 0;
FirebaseJson json;
const uint8_t output1 = 2;
const uint8_t output2 = 4;
const uint8_t output3 = 5;
const uint8_t output4 = 21;
const uint8_t output5 = 14;
const uint8_t output6 = 15;
const uint8_t output7 = 16;
const uint8_t output8 = 17;

void initWiFi() 
{
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi ..........");
  while (WiFi.status() != WL_CONNECTED) 
  { 
    Serial.print('.'); 
    delay(500);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());
  Serial.println();

  Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);
}

void applyRelayState(const String &gpio, const String &state)
{
  if (state != "0" && state != "1") return;
  const uint8_t outputs[] = {output1, output2, output3, output4, output5, output6, output7, output8};
  for (uint8_t output : outputs) {
    if (gpio == String(output)) {
      digitalWrite(output, state == "1" ? HIGH : LOW);
      return;
    }
  }
}

void streamCallback(FirebaseStream data)
{
  /*
  Serial.printf("stream path, %s\nevent path, %s\ndata type, %s\nevent type, %s\n\n",
                data.streamPath().c_str(),
                data.dataPath().c_str(),
                data.dataType().c_str(),
                data.eventType().c_str());
  printResult(data);
  Serial.println();
  */
  String streamPath = String(data.dataPath());
  if (data.dataTypeEnum() == fb_esp_rtdb_data_type_integer){
    String gpio = streamPath.substring(1);
    int state = data.intData();
    Serial.print("GPIO: ");
    Serial.println(gpio);
    Serial.print("STATE: ");
    Serial.println(state);
    applyRelayState(gpio, String(state));}
  if (data.dataTypeEnum() == fb_esp_rtdb_data_type_json){
    FirebaseJson json = data.to<FirebaseJson>();
    size_t count = json.iteratorBegin();
    Serial.println("\n---------");
    for (size_t i = 0; i < count; i++)
    {
      FirebaseJson::IteratorValue value = json.valueAt(i);
      String gpio = value.key;
      String state = value.value;
      Serial.print("STATE: ");
      Serial.println(state);
      Serial.print("GPIO:");
      Serial.println(gpio);
      applyRelayState(gpio, state);  //first run get former state
      Serial.printf("Name: %s, Value: %s, Type: %s\n", value.key.c_str(), value.value.c_str(), 
      value.type == FirebaseJson::JSON_OBJECT ? "object" : "array");
    }
    Serial.println();
    json.iteratorEnd();}
  Serial.printf("Received stream payload size: %d (Max. %d)\n\n", data.payloadLength(), 
  data.maxPayloadLength());
}

void streamTimeoutCallback(bool timeout)
{
  if (timeout)
    Serial.println("stream timeout, resuming...\n");
  if (!stream.httpConnected())
    Serial.printf("error code: %d, reason: %s\n\n", stream.httpCode(), 
    stream.errorReason().c_str());
}

void setup()
{
  Serial.begin(115200);
  pinMode(output1, OUTPUT);
  pinMode(output2, OUTPUT);
  pinMode(output3, OUTPUT);
  pinMode(output4, OUTPUT);
  pinMode(output5, OUTPUT);
  pinMode(output6, OUTPUT);
  pinMode(output7, OUTPUT);
  pinMode(output8, OUTPUT);
  digitalWrite(output1,1);
  digitalWrite(output2,1);
  digitalWrite(output3,1);
  digitalWrite(output4,1);
  digitalWrite(output5,1);
  digitalWrite(output6,1);
  digitalWrite(output7,1);
  digitalWrite(output8,1);

  initWiFi();
  
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.database_url = DATABASE_URL;

  Firebase.reconnectWiFi(true);

  config.token_status_callback = tokenStatusCallback;
  config.max_token_generation_retry = 5;

  Firebase.begin(&config, &auth);
  Serial.println("Getting User UID");

  while ((auth.token.uid) == "") { Serial.print('.'); delay(1000); }
  uid = auth.token.uid.c_str();
  Serial.print("User UID: ");
  Serial.println(uid);

  if (!Firebase.RTDB.beginStream(&stream, listenerPath.c_str()))
  { 
    Serial.printf("stream begin error, %s\n\n", stream.errorReason().c_str()); 
  }
  Firebase.RTDB.setStreamCallback(&stream, streamCallback, streamTimeoutCallback);
  delay(2000);
}

void loop()
{
  if (millis() - sendDataPrevMillis > 30000 || sendDataPrevMillis == 0) 
  {
    sendDataPrevMillis = millis();
    checkFirebaseConnection();
  }
  if (Firebase.isTokenExpired()){
    Firebase.refreshToken(&config);
    Serial.println("Refresh token");
  }
}

void checkFirebaseConnection() 
{
  if (Firebase.ready()) {
    Serial_Printf("Firebase Ready %d\n",count);
    count++;
    if(count >= 21474836) { 
      count = 0;
    }
  } 
  else 
  {
    Serial.print("Firebase Not ready !!!");
    Serial.println("  Restart ESP32.......");
    WiFi.disconnect();
    WiFi.reconnect();
    delay(5000); // Add a delay of 5 seconds between restart attempts
    restartCount++; // Increment the restart counter
    if (restartCount > 5) { // Limit the number of restart attempts to 5
      Serial.println("Exceeded maximum restart attempts. Stopping program.");
      while (1) {} // Enter a dead loop to stop the program execution
    }
    ESP.restart();
  }
}
