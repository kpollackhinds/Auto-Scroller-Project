#include <Servo.h>
#include <HCSR04.h>
const int servoPin=2;
const int trigPin=3;
const int echoPin=4;
Servo scroller;
HCSR04 hc(trigPin, new int[1]{echoPin},1);
bool autoScroll =false;
int lastScroll=0;
int direction=1;
int speed;
void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  scroller.attach(servoPin);
}

void loop() {
  // put your main code here, to run repeatedly:
  int distance = hc.dist(0);
  if(distance>100 && distance<300){
    //get message way TBD can all be changed later
    String message;
    speed=1; //scrolls/sec
    direction=1;//read these from message 
    if(message=="stop"){
      Stop();
      autoScroll=false;
    }else if(message =="auto"){
      autoScroll =true;
    }else if(message =="back"){
      Scroll(-1);
    }else if(message =="forward"){
      Scroll(1);
    }
    int delayTime = 1/speed;
    if(autoScroll && millis()>lastScroll+delayTime*1000){
      Scroll(direction);
    }
  }
}

void Stop(){
  scroller.write(90);
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
