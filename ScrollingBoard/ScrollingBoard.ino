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
bool prevOn=false;
bool audio=true;
void Stop(){ //Stops the servo by setting it to the center
  scroller.write(90);
}
void startSound(){ //Plays buzzer when it starts autoscrolling
  tone(buzzer,2500);
  delay(250);
  noTone(buzzer);
  delay(250);
  tone(buzzer,2500);
  delay(250);
  noTone(buzzer);
}
void stopSound(){//Plays buzzer when it stops autoscrolling
  tone(buzzer,100);
  delay(750);
  noTone(buzzer);
}
void Scroll(int dir){//Scroll based on the direction, up is 1 down is -1 
  if(dir ==-1){
    scroller.write(20);//not 0 and 180 so that it goes a little slower to allow it to scroll better
  }else if(dir==1){
    scroller.write(160);
  }
  //speed at 6V .17s per 60, 4.8V .2s per 60
  delay(170*6.5);//time to take to scroll a full rotation
  Stop(); //stops after a full rotation
}
void setup() {
  Serial1.begin(9600);
  Serial.begin(9600);
  pinMode(buzzer,OUTPUT);
  scroller.attach(servoPin);
}

void loop() {
  distance = hc.dist(0);//reads the distance from the ultrasonic
  //Serial.println(distance);
  //scroll_state ="";
  //scroll_speed="";
  //sound_state="";
  message="";//resets the message every loop so nothing happens if nothing is sent
  if((distance>20 && distance<200)||distance==0){//if someone if in front of the ultrasonic
    //get message way TBD can all be changed later
    while (Serial1.available() > 0) {//if there is something in the serial
      //data,scroll_state,scroll_speed,sound_state
      //data -> up down left right
      //scroll_state -> on off
      //scroll_speed -> int
      //sound_state -> on off
      message = Serial1.readStringUntil(',');//read the serial and parse the data
      //Serial1.read();
      scroll_state=Serial1.readStringUntil(',');
      //Serial1.read();
      scroll_speed=Serial1.readStringUntil(',');
      //Serial1.read();
      sound_state = Serial1.readStringUntil('\n');
      Serial.println(message);
      Serial.println(scroll_state);
      Serial.println(scroll_speed); 
      Serial.println(sound_state);
    }
    if(sound_state.equals("on")){//sets the audio levels based on what was just sent throuhg serial
      audio=true;
    }else if(sound_state.equals("off")){
      audio=false;
    }
    if(autoScroll && scroll_state.equals("off")){//if already scrolling told to go off
      Stop();//stop 
      if(audio){//play the stop sound if not muted
        stopSound();
      }
      autoScroll=false;
    }else if(!autoScroll && scroll_state.equals("on")){//if not scrolling and told to start
      if(audio){//play the start sound if not muted
        startSound();
      }
      autoScroll =true;
    }else if(!autoScroll && message.equals("down")){//if not scrolling and told to go down once
      Scroll(-1);//scroll down only once
    }else if(!autoScroll && message.equals("up")){//if not scrolling and told to go up once
      Scroll(1);//scroll up only once
    }
    delayTime = abs(scroll_speed.toInt());//convert  speed given over serial to an positive int
    if(delayTime!=0){//avoid divide by 0 errors
      direction=scroll_speed.toInt() / delayTime;//gets the magnitude of the speed sent to determine with direction to scroll 
    }
    if(autoScroll && millis()>lastScroll+delayTime){//if scrolling and the delay time has passed since last scroll
      if(!prevOn&&audio){//if it was just off (as in the person was not in front of the sensor) and not muted play the start sound
        startSound();
      }
      Scroll(direction); //scroll once in the proper direction
      Serial1.write("scroll\n");//tell pico + website that it scrolled once
      lastScroll=millis();//mark last time it scrolled
    }
    prevOn=true;
  }
  else{//if the person moves away from the sensor
    Serial.println(distance);
    if(prevOn&&autoScroll){//if it was just scrolling and is on auto scrolling play the stop sound
      if(audio){
        stopSound();
      }
      prevOn=false;
    }
    //Serial1.write("away\n");
  }
}


