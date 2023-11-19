from django.db import models

# Create your models here.

class UserInfo(models.Model):
    num_scrolls = models.IntegerField()
    screen_time = models.FloatField()
    name = models.CharField(max_length=200)