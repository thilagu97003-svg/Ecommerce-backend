from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.response import Response
from rest_framework import status
from drf_spectacular.utils import extend_schema
from products.models import CartItem
from .models import Order
from .serializers import OrderSerializer


@extend_schema(request=OrderSerializer, responses={200: OrderSerializer(many=True), 201: OrderSerializer})
@api_view(["GET", "POST"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def create_order(request):
    # 1. GET request vanthaal orders list-ah return pannum (MyOrders page matrum Browser check-kaga)
    if request.method == "GET":
        if request.user.is_staff:
            orders = Order.objects.all().order_by("-created_at")
        else:
            orders = Order.objects.filter(customer=request.user).order_by("-created_at")
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # 2. POST request vanthaal new order create aagum
    serializer = OrderSerializer(data=request.data)

    if serializer.is_valid():
        order = serializer.save(customer=request.user)

        cart_item_ids = request.data.get("cart_item_ids", [])
        if cart_item_ids:
            CartItem.objects.filter(
                id__in=cart_item_ids,
                cart__customer=request.user,
            ).delete()

        return Response(
            {
                "message": "Order created successfully",
                "order_id": order.id,
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@extend_schema(request=OrderSerializer, responses={200: OrderSerializer})
@api_view(["GET", "PUT", "DELETE"])
@authentication_classes([JWTAuthentication, SessionAuthentication])
@permission_classes([IsAuthenticated])
def order_detail(request, order_id):
    try:
        if request.user.is_staff:
            order = Order.objects.get(id=order_id)
        else:
            order = Order.objects.get(id=order_id, customer=request.user)
    except Order.DoesNotExist:
        return Response(
            {"error": "Order not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    if request.method == "GET":
        return Response(OrderSerializer(order).data)

    if request.method == "PUT":
        serializer = OrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    order.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)