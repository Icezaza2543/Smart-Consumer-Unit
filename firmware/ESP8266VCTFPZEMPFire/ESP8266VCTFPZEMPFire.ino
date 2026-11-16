#include "secrets.h"
#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <Adafruit_ADS1X15.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>
#include <DHT.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <Firebase_ESP_Client.h>
#include "addons/TokenHelper.h"
#include "addons/RTDBHelper.h"
#include <SoftwareSerial.h>
#include <PZEM004Tv30.h>
#define DHTPIN D1
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org");
SoftwareSerial pzemSWSerial(D5, D6);
PZEM004Tv30 pzem(pzemSWSerial);







#define Flame D2
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;
String uid;
String databasePath;
String tempPath = "/temperature";
String humPath = "/humidity";
String timePath = "/timestamp";
String currentPath ="/current";
String PowerPath ="/power";
String VoltagePath = "/voltage";
String SensorPath = "board1/Sensor/";
String DisplayPath = "board1/Display/Time";
String FreqPath = "/Freq";
String PFPath = "/PowerFactor";
String FlamePath = "/FlameStatus";
String FlameData = "Error!";
FirebaseJson json;
int temperature;
int humidity;
int timestamp;
int Flame_stats;
float ct;
float RealVolt;
float Power;
float frequency;
float power_factor;
unsigned long sendDataPrevMillis = 0;
unsigned long timerDelay = 1800000; 

void initWiFi() 
{
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  WiFi.setSleepMode(WIFI_NONE_SLEEP);
  Serial.print("Connecting to WiFi ..");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print('.');
    delay(1000);
  }
  Serial.println(WiFi.localIP());
  Serial.println();
}

unsigned long getTime() 
{
  timeClient.update();
  unsigned long now = timeClient.getEpochTime();
  return now;
}

void setup() 
{
  Serial.begin(115200);
  pinMode(Flame, INPUT);
  dht.begin(); 
  initWiFi();
  timeClient.begin();
  config.api_key = API_KEY;
  auth.user.email = USER_EMAIL;
  auth.user.password = USER_PASSWORD;
  config.database_url = DATABASE_URL;
  Firebase.reconnectWiFi(true);
  fbdo.setResponseSize(4096);
  config.token_status_callback = tokenStatusCallback;
  config.max_token_generation_retry = 5;
  Firebase.begin(&config, &auth);
  Serial.println("Getting User UID");
  while ((auth.token.uid) == "") {
    Serial.print('.');
    delay(1000);
  }
  uid = auth.token.uid.c_str();
  Serial.print("User UID: ");
  Serial.println(uid);
}

void PZEM()
{
  Serial.print("PZEM Address:");
  Serial.println(pzem.readAddress(), HEX);
  float voltagePZEM = pzem.voltage();
  float currentPZEM = pzem.current();
  float powerPZEM = pzem.power();
  float energyPZEM = pzem.energy();
  float frequencyPZEM = pzem.frequency();
  float pfPZEM = pzem.pf();
  Serial.println("========================================================");
  Serial.print("Voltage: ");      Serial.print(voltagePZEM);      Serial.println("V");
  Serial.print("Current: ");      Serial.print(currentPZEM);      Serial.println("A");
  Serial.print("Power: ");        Serial.print(powerPZEM);        Serial.println("W");
  Serial.print("Energy: ");       Serial.print(energyPZEM,3);     Serial.println("kWh");
  Serial.print("Frequency: ");    Serial.print(frequencyPZEM, 1); Serial.println("Hz");
  Serial.print("PF: ");           Serial.println(pfPZEM);
  Serial.println("========================================================");
  RealVolt = voltagePZEM;
  ct = currentPZEM;
  Power = powerPZEM;
  frequency = frequencyPZEM;
  power_factor = pfPZEM;
  return;
}

void flame()
{
  Flame_stats = digitalRead(Flame);
  Serial.print("Flame Status: ");      
  Serial.print(Flame_stats);
  Serial.println("========================================================");
  FlameData = Flame_stats == HIGH ? "Warning!!!" : "Normal";
  return;
}

void loop() 
{ 
  if (Firebase.ready() && (millis() - sendDataPrevMillis > timerDelay || sendDataPrevMillis == 0))
  {
    sendDataPrevMillis = millis();
    //Get current timestamp
    timestamp = getTime();
    if (timestamp < 1609459200) {
      Serial.println("Waiting for NTP synchronization");
      return;
    }
    Serial.print ("time: ");
    Serial.println (timestamp);
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();
    if (isnan(humidity) || isnan(temperature)) 
    {
      Serial.println("Failed to read from DHT sensor!");
      return;
    }
    PZEM();
    flame();//new
    Serial.print(" DBVoltage: ");
    Serial.println(RealVolt);
    Serial.print("  DBCurrent: ");
    Serial.println(ct);
    Serial.print("  DBPower: ");
    Serial.println(Power);
    Serial.print("  DBTemp: ");
    Serial.println(temperature);
    Serial.print("  DBHumid: ");
    Serial.println(humidity);
    Serial.print("  FireStat: ");         //new
    Serial.println(Flame_stats);            //new
    Serial.print("  DBFireData: ");         //new
    Serial.println(FlameData);            //new
    SensorPath = "board1/Sensor/" + String(timestamp);
    json.set(tempPath.c_str(), String(temperature));
    json.set(humPath.c_str(), String(humidity));
    json.set(currentPath.c_str(), String(ct));
    json.set(PowerPath.c_str(), String(Power));
    json.set(VoltagePath.c_str(), String(RealVolt));
    json.set(FreqPath.c_str(), String(frequency));
    json.set(PFPath.c_str(), String(power_factor));
    json.set(FlamePath.c_str(), String(FlameData)); //new
    json.set(timePath, String(timestamp));
    if (!isfinite(RealVolt) || !isfinite(ct) || !isfinite(Power) ||
        !isfinite(frequency) || !isfinite(power_factor)) {
      Serial.println("Incomplete PZEM reading");
      return;
    }
    // A single multi-location update keeps the display pointer and sample consistent.
    FirebaseJson update;
    // Firebase PATCH accepts slash-delimited keys for deep-path updates.
    String payload = "{\"Sensor/" + String(timestamp) + "\":" + json.raw() +
                     ",\"Display/Time\":" + String(timestamp) + "}";
    update.setJsonData(payload);
    if (!Firebase.RTDB.updateNode(&fbdo, "/board1", &update)) {
      Serial.println(fbdo.errorReason());
    }
  }
}
