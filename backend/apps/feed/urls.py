from django.urls import path

from . import views

urlpatterns = [
    path("posts/", views.PostListCreateAPIView.as_view(), name="post-list-create"),
    path("posts/<int:pk>/", views.PostDetailAPIView.as_view(), name="post-detail"),
    path(
        "posts/<int:pk>/like/",
        views.PostLikeToggleAPIView.as_view(),
        name="post-like-toggle",
    ),
    path(
        "posts/<int:pk>/likes/",
        views.PostLikersAPIView.as_view(),
        name="post-likers",
    ),
    path(
        "posts/<int:pk>/comments/",
        views.CommentListCreateAPIView.as_view(),
        name="post-comments",
    ),
    path(
        "comments/<int:pk>/like/",
        views.CommentLikeToggleAPIView.as_view(),
        name="comment-like-toggle",
    ),
    path(
        "comments/<int:pk>/likes/",
        views.CommentLikersAPIView.as_view(),
        name="comment-likers",
    ),
    path(
        "comments/<int:pk>/replies/",
        views.ReplyListCreateAPIView.as_view(),
        name="comment-replies",
    ),
    path(
        "replies/<int:pk>/like/",
        views.ReplyLikeToggleAPIView.as_view(),
        name="reply-like-toggle",
    ),
    path(
        "replies/<int:pk>/likes/",
        views.ReplyLikersAPIView.as_view(),
        name="reply-likers",
    ),
]
