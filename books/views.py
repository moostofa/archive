from django.http import request
from django.shortcuts import render

def index(request):
    return render(request, "books/index.html")