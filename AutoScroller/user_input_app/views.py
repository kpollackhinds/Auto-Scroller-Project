from django.shortcuts import render, HttpResponse
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

import json

# global variable tracking state of buttons
current_state = {}

# Create your views here.
def home(request):
    return render(request, "index.html")

# fucntion to handle ajax post request from front-end
@csrf_exempt
def update_setting_states(request):
    global current_state
    if request.method == 'POST':
        data = json.loads(request.body)
        current_state = {
            "sound_state": data.get('soundState'),
            "scroll_state": data.get('scrollState'),
            "scroll_speed": data.get('scrollSpeed'),
        }
        print('y')
        return JsonResponse({'status': 'success'})
    return JsonResponse({'status': 'error'}, status = 400)

# function to handle get request from device powering motor
def get_setting_states(request):
    return JsonResponse(current_state)