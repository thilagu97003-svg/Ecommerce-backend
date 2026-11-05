from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from django.urls import re_path
from django.views.static import serve



from products.views import product_list, add_to_cart, get_cart, remove_cart_item
from accounts.views import register_user, login_user
from orders.views import create_order, order_detail
from django.urls import path, include
from contact.views import contact_view, csrf_token


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/products/", product_list, name="product_list"),
    path("api/register/", register_user, name="register_user"),
    path("api/login/", login_user, name="login_user"),
    path("api/orders/", create_order, name="create_order"),
    path("api/orders/<int:order_id>/", order_detail, name="order_detail"),

    path("api/cart/add/", add_to_cart, name="add_to_cart"),
    path("api/cart/", get_cart, name="get_cart"),
    path(
        "api/cart/<int:item_id>/",
        remove_cart_item,
        name="remove_cart_item",
    ),

    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/schema/swagger-ui/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/contact/", include("contact.urls")),
    path("api/about/", include("about.urls")),
    path("api/home/", include("home.urls")),
    re_path(r"^media/(?P<path>.*)$", serve, {"document_root": settings.MEDIA_ROOT}),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )