from django.shortcuts import render
from django.http import JsonResponse

def index(request):
    return render(request, "books/index.html")

def action(request):
    json = {
        "message": "It worked!!",
    }
    return JsonResponse(json)