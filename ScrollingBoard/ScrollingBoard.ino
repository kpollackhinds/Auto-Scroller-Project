#include <Servo.h>
#include <HCSR04.h>

const int servoPin=13;
const int trigPin=3;
const int echoPin=4;
const int buzzer=12;
Servo scroller;
HCSR04 hc(trigPin, new int[1]{echoPin},1);
bool autoScroll =false;
long lastScroll=0;
int distance;
String message, sound_state, scroll_state, scroll_speed;
int direction=1;
int delayTime;
bool prevOn=true;
bool audio=true;
void Stop(){
  scroller.write(90);
}
void startSound(){
  tone(buzzer,2500);
  delay(250);
  noTone(buzzer);
  delay(250);
  tone(buzzer,2500);
  delay(250);
  noTone(buzzer);
}
void stopSound(){
  tone(buzzer,100);
  delay(750);
  noTone(buzzer);
}
void Scroll(int dir){
  if(dir ==-1){
    scroller.write(0);
  }else if(dir==1){
    scroller.write(180);
  }
  //speed at 6V .17s per 60, 4.8V .2s per 60
  delay(170*6);
  Stop();
}
void setup() {
  Serial1.begin(9600);
  pinMode(buzzer,OUTPUT);
  scroller.attach(servoPin);
}

void loop() {
  distance = hc.dist(0);
  scroll_state ="";
  scroll_speed="";
  sound_state="";
  message="";
  if(distance>50 && distance<200){
    //get message way TBD can all be changed later
    while (Serial1.available() >= 0) {
      //data,scroll_state,scroll_speed,sound_state
      //data -> up down left right
      //scroll_state -> on off
      //scroll_speed -> int
      //sound_state -> on off
      message = Serial1.readStringUntil(',');
      Serial1.read();
      scroll_state=Serial1.readStringUntil(',');
      Serial1.read();
      scroll_speed=Serial1.readStringUntil(',');
      Serial1.read();
      sound_state = Serial1.readStringUntil('\n');
      Serial.print(message + scroll_state + scroll_speed+ sound_state);
    }
    if(sound_state.equals("on")){
      audio=true;
    }else if(sound_state.equals("off")){
      audio=false;
    }
    if(autoScroll && scroll_state.equals("off")){
      Stop();
      if(audio){
        stopSound();
      }
      autoScroll=false;
    }else if(!autoScroll && scroll_state.equals("on")){
      if(audio){
        startSound();
      }
      autoScroll =true;
    }else if(!autoScroll && message.equals("down")){
      Scroll(-1);
    }else if(!autoScroll && message.equals("up")){
      Scroll(1);
    }
    delayTime = abs(scroll_speed.toInt());
    direction=scroll_speed.toInt()/delayTime;
    if(autoScroll && millis()>lastScroll+delayTime*1000){
      if(!prevOn&&audio){
        startSound();
      }
      Scroll(direction);
      Serial1.write("scroll\n");
      lastScroll=millis();
    }
    prevOn=true;
  }
  else{
    //send message to stop count
    if(prevOn){
      if(audio){
        stopSound();
      }
      prevOn=false;
    }
    //Serial1.write("away\n");
  }
}


