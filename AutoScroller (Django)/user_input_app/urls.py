from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name = "home"),
    path('update_state', views.update_setting_states, name= 'update_state'),
    path('get_state', views.get_setting_states, name = 'get_state'),
]