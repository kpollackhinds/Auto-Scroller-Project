import machine
from machine import Pin, UART
import network, urequests
import gc
from ws_connection import connect_to_socket
from secrets import Secrets

led = Pin("LED", Pin.OUT, value=0)
uart = UART(1, baudrate=9600, tx=Pin(4), rx=Pin(5))
uart.init(bits=8, parity=None, stop=2)
scroll_speed = ''
scroll_state = ''
sound_state = ''
direction = 1
secrets = Secrets()
# Secrets object defined as 
# class Secrets:
#     def __init__(self) -> None:
#         self.ssid = "******"
#         self.pw = "*****"

#         self.server_ip = "*****" #my house

#         self.port = ****

ssid, pw = secrets.ssid, secrets.pw
global wlan
wlan = network.WLAN(network.STA_IF)

state_url = f"http://{secrets.server_ip}:8080/get_setting_states"

while True:
    sock = connect_to_socket(ssid, pw, wlan, secrets.server_ip, secrets.port, led)
    if sock is not None:
        led.on()
        while True:
            try:
                data = sock.readline()
                if not data:
                    break

                data = data[:-1]
                if data == b'mkrq':
                #    run garbage collector to free up ram before making request
                    gc.collect() 
                    
                    # will need to change url based on what wifi you are connected to
                    response = urequests.get(state_url)
                    response = response.json()
                    print(response)
                    scroll_speed = response["scroll_speed"]
                    scroll_state = response["scroll_state"]
                    sound_state = response["sound_state"]
                    direction = response["dir"]
                #     print(scroll_speed, direction)
                    if not direction:
                        direction = 1
                    
                    if scroll_speed == "":
                        scroll_speed = 1000

                    command_string = ''+ ',' + scroll_state + ',' + str(int(scroll_speed) * int(direction)) + ',' + sound_state + '\n'
                    uart.write(command_string)
                    print(command_string)
                else:
                    # need to combine scroll command and speed 
                    command_string = data + ',' + scroll_state + ',' + str(int(scroll_speed)*int(direction)) + ',' + sound_state + '\n'
                    uart.write(command_string)
                    print(command_string)


                # print(data)
            except OSError as e:
                #handle socket erros or connection issues
                print("Socket error: ", e)
                sock.close()
                wlan.disconnect()
                wlan.active(False)
                led.off()
                break
            except KeyboardInterrupt:
                print('interrupt')
                sock.close()
                wlan.disconnect()
                wlan.active(False)
                led.off()
                break

sock.close()
wlan.disconnect()
wlan.active(False )
sleep(3)
machine.reset()