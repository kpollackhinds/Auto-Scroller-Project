#include <Arduino_LSM6DS3.h>
#include "secrets.h"

//define this in secrets.h and change later
#include <SPI.h>
#include <WiFiNINA.h>

//please enter your sensitive data in the Secret tab
int status = WL_IDLE_STATUS;             // the Wi-Fi radio's status
unsigned long previousMillisInfo = 0;     //will store last time Wi-Fi information was updated
unsigned long previousMillisLED = 0;      // will store the last time LED was updated
int ledState = LOW;                       //ledState used to set the LED

float x, y, z;
int degreesX = 0;
int degreesY = 0;

//if out of 8 consequtive readings, 5 of them are above 2, then send scroll up command
int up_threshold_num = 5;
float up_threshold = 2;
int z_patience = 8;
int z_window_sum = 0;

const int windowSize = 8;
float z_window[windowSize] = {0};
int z_window_index = 0;

float x_window[windowSize] = {0};
int x_window_index  = 0;

long currTime = 0;
long prevTime = 0;
int time_between_readings = 500;
WiFiClient client;
enum state
{
  rest = 0,
  tilt_up = 1,
  tilt_down = 2,
  tilt_left = 3,
  tilt_right = 4,
};

void setup() {
  state State;
  State = rest;
  Serial.begin(9600);
  while (!Serial){}; //waiting for serial port to begin

  if (!IMU.begin()) {
    Serial.println("Failed to initialize IMU!");
    while (1);
  }
  
  // set the LED as output
  pinMode(LED_BUILTIN, OUTPUT);

  // attempt to connect to Wi-Fi network:
  while (status != WL_CONNECTED) {
    Serial.print("Attempting to connect to network: ");
    Serial.println(ssid);
    // Connect to WPA/WPA2 network:
    status = WiFi.begin(ssid, pass);
    // wait 10 seconds for connection:
    delay(3000);
  }
  
  Serial.println("You're connected to the network");
  Serial.println("---------------------------------------");

  //connecting to socket 
  while (!client.connect(ip_address, REMOTE_PORT)) {
    Serial.println("Connection failed.");
    Serial.println("Waiting a moment before retrying...");
  }

  Serial.println("Connected");
  client.print("Hello\n");
  client.print("This is my IP.\n");
  // if (!IMU.begin()) {
  //   Serial.println("Failed to initialize IMU!");
  //   while (1);
  // }

  // Serial.print("Accelerometer sample rate = ");
  // Serial.print(IMU.accelerationSampleRate());
  // Serial.println("Hz");

   // you're connected now, so print out the data:
}

void loop() {

  if (IMU.accelerationAvailable()) {
    IMU.readAcceleration(x, y, z);

    // Add the new z value to the window
    z_window[z_window_index] = z;
    z_window_index = (z_window_index + 1) % windowSize;

    x_window[x_window_index] = y;
    x_window_index = (x_window_index + 1) % windowSize;

    int count_above_threshold = 0;
    int count_below_threshold = 0;

    int x_count_above_threshold = 0;
    int x_count_below_threshold = 0;

    for (int i = 0; i < windowSize; i++) {
      if (z_window[i] > 2.0) {
        count_above_threshold++;
      }
      else if(z_window[i] < -2.5){
        count_below_threshold++;
      }

      if (x_window[i] > 2.0) {
        x_count_above_threshold++;
      }
      else if(x_window[i] < -2.0){
        x_count_below_threshold++;
      }
    }

    if (count_above_threshold >= 4) {
      if ((millis() - prevTime ) > time_between_readings){
          Serial.print("up\n");
          client.print("up\n");
      }
      prevTime = millis();
      count_above_threshold = 0;
    }

    else if(count_below_threshold >= 4){
      if ((millis() - prevTime ) > time_between_readings){
          Serial.print("down\n");
          client.print("down\n");

      }
      prevTime = millis();
      count_below_threshold = 0;
    }

    if (x_count_above_threshold >= 4) {
      if ((millis() - prevTime ) > time_between_readings){
          Serial.print("right\n");
          client.print("right\n");
      }
      prevTime = millis();
      x_count_above_threshold = 0;
    }

    else if(x_count_below_threshold >= 4){
      if ((millis() - prevTime ) > time_between_readings){
          Serial.print("left\n");
          client.print("left\n");
      }
      prevTime = millis();
      x_count_below_threshold = 0;
    }
  }

  // if (IMU.accelerationAvailable()) {
  //   IMU.readAcceleration(x, y, z);
  // }
  // Serial.print(x);
  // Serial.print(",");
  // Serial.print(y);
  // Serial.print(",");
  // Serial.println(z);

  // if (x > 0.1) {
  //   x = 100 * x;
  //   degreesX = map(x, 0, 97, 0, 90);
  //   Serial.print("Tilting up ");
  //   Serial.print(degreesX);
  //   Serial.println("  degrees");

  //   // State = tilt_up;
  // }
  // else if (x < -0.1) {
  //   x = 100 * x;
  //   degreesX = map(x, 0, -100, 0, 90);
  //   Serial.print("Tilting down ");
  //   Serial.print(degreesX);
  //   Serial.println("  degrees");

  //   // State = tilt_down;
  // }
  // if (y > 0.1) {
  //   y = 100 * y;
  //   degreesY = map(y, 0, 97, 0, 90);
  //   Serial.print("Tilting left ");
  //   Serial.print(degreesY);
  //   Serial.println("  degrees");
  // }
  // if (y < -0.1) {
  //   y = 100 * y;
  //   degreesY = map(y, 0, -100, 0, 90);
  //   Serial.print("Tilting right ");
  //   Serial.print(degreesY);
  //   Serial.println("  degrees");
  // }

  // State = rest;
  delay(10);
}