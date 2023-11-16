#include <Arduino_LSM6DS3.h>
#include <WiFiNINA.h>
// #include "secrets.h"

//define this in secrets.h and change later
char ssid[];
char pass[];

float x, y, z;
int degreesX = 0;
int degreesY = 0;

WifiClient client;
enum state
{
  rest = 0;
  tilt_up = 1;
  tilt_down = 2;
  tilt_left = 3;
  tilt_right = 4;
}

void setup() {
  state State;
  State = rest;
  Serial.begin(9600);
  while (!Serial){}; //waiting for serial port to begin
  
  
  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }

  Serial.print("Accelerometer sample rate = ");
  Serial.print(IMU.accelerationSampleRate());
  Serial.println("Hz");

  while (status != WL_CONNECTED){
    Wifi.begin(ssid, pass);

  }
}

void loop() {
  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(x, y, z);
  }

  if (x > 0.1) {
    x = 100 * x;
    degreesX = map(x, 0, 97, 0, 90);
    Serial.print("Tilting up ");
    Serial.print(degreesX);
    Serial.println("  degrees");

    State = tilt_up;
  }
  else if (x < -0.1) {
    x = 100 * x;
    degreesX = map(x, 0, -100, 0, 90);
    Serial.print("Tilting down ");
    Serial.print(degreesX);
    Serial.println("  degrees");

    State = tilt_down;
  }
  if (y > 0.1) {
    y = 100 * y;
    degreesY = map(y, 0, 97, 0, 90);
    Serial.print("Tilting left ");
    Serial.print(degreesY);
    Serial.println("  degrees");
  }
  if (y < -0.1) {
    y = 100 * y;
    degreesY = map(y, 0, -100, 0, 90);
    Serial.print("Tilting right ");
    Serial.print(degreesY);
    Serial.println("  degrees");
  }

  State = rest;
  delay(500);
}