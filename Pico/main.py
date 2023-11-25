import machine
from machine import Pin
import network, urequests
import gc
from ws_connection import connect_to_socket
from secrets import Secrets

led = Pin("LED", Pin.OUT, value=0)

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

while True:
    sock = connect_to_socket(ssid, pw, wlan, secrets.server_ip, secrets.port)
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
                   response = urequests.get('http://192.168.1.187:8080/get_setting_states')
                   response = response.json()
                   print(response)

                else:
                    pass

                print(data[:-1])
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