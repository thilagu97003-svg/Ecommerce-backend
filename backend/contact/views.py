import json
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_http_methods
from .models import ContactMessage
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})


@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def contact_view(request):
    if request.method == "GET":
        if not request.user.is_staff:
            return Response({"error": "Admin login required"}, status=403)
        messages = ContactMessage.objects.order_by("-created_at").values(
            "id", "name", "email", "phone", "message", "created_at"
        )
        return Response(list(messages))

    data = request.data
    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip()
    phone = str(data.get("phone", "")).strip()
    message = str(data.get("message", "")).strip()

    if not (name and email and phone and message):
        return Response({"error": "All fields are required"}, status=400)

    ContactMessage.objects.create(
        name=name, email=email, phone=phone, message=message
    )

    return JsonResponse({"success": True}, status=201)