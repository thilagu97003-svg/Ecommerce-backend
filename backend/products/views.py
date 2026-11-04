from django.http import JsonResponse
from rest_framework.decorators import (
    api_view,
    permission_classes,
    authentication_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema

from .models import Product, Order, OrderItem, Cart, CartItem
from .serializers import OrderSerializer


# 1. Product List API
@api_view(["GET"])
def product_list(request):
    products = Product.objects.all().values(
        "id",
        "name",
        "category",
        "description",
        "price",
        "image",
        "stock",
    )
    return Response(list(products), status=status.HTTP_200_OK)


# 2. Create Order API
@api_view(["POST"])
def create_order(request):
    serializer = OrderSerializer(data=request.data)

    if serializer.is_valid():
        order = serializer.save()
        return Response(
            {
                "message": "Order created successfully",
                "order_id": order.order_id,
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# 3. Add to Cart API
@extend_schema(
    request={
        "application/json": {
            "type": "object",
            "properties": {
                "product_id": {"type": "integer"},
                "size": {"type": "string"},
                "quantity": {"type": "integer", "default": 1},
            },
            "required": ["product_id", "size"],
        }
    }
)
@api_view(["POST"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    product_id = request.data.get("product_id")
    size = request.data.get("size")
    quantity = request.data.get("quantity", 1)

    if not product_id or not size:
        return Response(
            {"error": "product_id and size are required"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        quantity = int(quantity)
        if quantity < 1:
            raise ValueError
    except (TypeError, ValueError):
        return Response(
            {"error": "quantity must be a positive integer"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response(
            {"error": "Product not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    cart, _ = Cart.objects.get_or_create(customer=request.user)

    item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product,
        size=size,
        defaults={"quantity": quantity},
    )

    if not created:
        item.quantity += quantity
        item.save()

    return Response(
        {
            "message": "Added to cart",
            "cart_item_id": item.id,
            "quantity": item.quantity,
        },
        status=status.HTTP_201_CREATED,
    )


# 4. Get Cart API (Admin Session + JWT rendum allow aagum)
@api_view(["GET"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def get_cart(request):
    # Review-kaga: Admin / Superuser browser-la direct-ah check pannumbodhu,
    # database-la irukra active customer cart-ai JSON-aaga kaattum.
    if request.user.is_staff:
        cart = Cart.objects.filter(items__isnull=False).distinct().last()
        if not cart:
            cart, _ = Cart.objects.get_or_create(customer=request.user)
    else:
        # Frontend JWT token moolama login aagi irukra user-oda cart
        cart, _ = Cart.objects.get_or_create(customer=request.user)

    items = CartItem.objects.filter(cart=cart).select_related("product")

    cart_items = []
    for item in items:
        image_url = ""
        if item.product.image:
            image_url = request.build_absolute_uri(item.product.image.url)

        cart_items.append(
            {
                "cart_item_id": item.id,
                "product_id": item.product.id,
                "name": item.product.name,
                "category": item.product.category,
                "description": item.product.description,
                "price": str(item.product.price),
                "image": image_url,
                "size": item.size,
                "quantity": item.quantity,
            }
        )

    return Response({"items": cart_items}, status=status.HTTP_200_OK)

# 5. Remove Cart Item API
@api_view(["DELETE"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def remove_cart_item(request, item_id):
    cart, _ = Cart.objects.get_or_create(customer=request.user)

    try:
        item = CartItem.objects.get(id=item_id, cart=cart)
    except CartItem.DoesNotExist:
        return Response(
            {"error": "Cart item not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    item.delete()
    return Response({"message": "Item removed"}, status=status.HTTP_200_OK)