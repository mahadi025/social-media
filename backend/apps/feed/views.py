from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Exists, F, OuterRef, Q
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers, status
from rest_framework.pagination import CursorPagination, PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.auth.serializers import PublicUserSerializer

from .models import Comment, CommentLike, Post, PostLike, Reply, ReplyLike
from .permissions import (
    get_visible_comment_or_404,
    get_visible_post_or_404,
    get_visible_reply_or_404,
)
from .serializers import CommentSerializer, PostSerializer, ReplySerializer

User = get_user_model()

LikeToggleResponseSerializer = inline_serializer(
    name="LikeToggleResponse",
    fields={
        "liked": serializers.BooleanField(),
        "likes_count": serializers.IntegerField(),
    },
)


class PostCursorPagination(CursorPagination):
    page_size = 20
    ordering = ("-created_at", "-id")


class DefaultPagination(PageNumberPagination):
    page_size = 20


def _with_liked_by_me(queryset, user, like_model, field_name):
    return queryset.annotate(
        liked_by_me=Exists(
            like_model.objects.filter(**{field_name: OuterRef("pk"), "user": user})
        )
    )


def _toggle_like(like_model, target, related_field, user):
    """Toggle a like on `target` (a Post/Comment/Reply instance), keeping its
    denormalized likes_count in sync. Returns whether it's now liked."""
    with transaction.atomic():
        like, created = like_model.objects.get_or_create(
            user=user, **{related_field: target}
        )
        delta = 1
        if not created:
            like.delete()
            delta = -1
        type(target).objects.filter(pk=target.pk).update(
            likes_count=F("likes_count") + delta
        )
    return created


class PostListCreateAPIView(APIView):
    pagination_class = PostCursorPagination

    @extend_schema(tags=["Feed"], responses={200: PostSerializer(many=True)})
    def get(self, request):
        queryset = Post.objects.select_related("author").filter(
            Q(visibility=Post.Visibility.PUBLIC) | Q(author=request.user)
        )
        queryset = _with_liked_by_me(queryset, request.user, PostLike, "post")

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = PostSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(tags=["Feed"], request=PostSerializer, responses={201: PostSerializer})
    def post(self, request):
        serializer = PostSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PostDetailAPIView(APIView):
    @extend_schema(tags=["Feed"], responses={200: PostSerializer})
    def get(self, request, pk):
        get_visible_post_or_404(request, pk)
        queryset = _with_liked_by_me(
            Post.objects.select_related("author").filter(pk=pk),
            request.user,
            PostLike,
            "post",
        )
        serializer = PostSerializer(queryset.get(), context={"request": request})
        return Response(serializer.data)


class PostLikeToggleAPIView(APIView):
    @extend_schema(tags=["Feed"], request=None, responses={200: LikeToggleResponseSerializer})
    def post(self, request, pk):
        post = get_visible_post_or_404(request, pk)
        liked = _toggle_like(PostLike, post, "post", request.user)
        post.refresh_from_db(fields=["likes_count"])
        return Response({"liked": liked, "likes_count": post.likes_count})


class PostLikersAPIView(APIView):
    pagination_class = DefaultPagination

    @extend_schema(tags=["Feed"], responses={200: PublicUserSerializer(many=True)})
    def get(self, request, pk):
        post = get_visible_post_or_404(request, pk)
        users = User.objects.filter(post_likes__post=post).order_by(
            "-post_likes__created_at"
        )
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(users, request, view=self)
        serializer = PublicUserSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class CommentListCreateAPIView(APIView):
    pagination_class = DefaultPagination

    @extend_schema(tags=["Feed"], responses={200: CommentSerializer(many=True)})
    def get(self, request, pk):
        post = get_visible_post_or_404(request, pk)
        queryset = Comment.objects.select_related("author").filter(post=post)
        queryset = _with_liked_by_me(queryset, request.user, CommentLike, "comment")

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = CommentSerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        tags=["Feed"], request=CommentSerializer, responses={201: CommentSerializer}
    )
    def post(self, request, pk):
        post = get_visible_post_or_404(request, pk)
        serializer = CommentSerializer(
            data=request.data, context={"request": request, "post": post}
        )
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            serializer.save()
            Post.objects.filter(pk=post.pk).update(
                comments_count=F("comments_count") + 1
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CommentLikeToggleAPIView(APIView):
    @extend_schema(tags=["Feed"], request=None, responses={200: LikeToggleResponseSerializer})
    def post(self, request, pk):
        comment = get_visible_comment_or_404(request, pk)
        liked = _toggle_like(CommentLike, comment, "comment", request.user)
        comment.refresh_from_db(fields=["likes_count"])
        return Response({"liked": liked, "likes_count": comment.likes_count})


class CommentLikersAPIView(APIView):
    pagination_class = DefaultPagination

    @extend_schema(tags=["Feed"], responses={200: PublicUserSerializer(many=True)})
    def get(self, request, pk):
        comment = get_visible_comment_or_404(request, pk)
        users = User.objects.filter(comment_likes__comment=comment).order_by(
            "-comment_likes__created_at"
        )
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(users, request, view=self)
        serializer = PublicUserSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)


class ReplyListCreateAPIView(APIView):
    pagination_class = DefaultPagination

    @extend_schema(tags=["Feed"], responses={200: ReplySerializer(many=True)})
    def get(self, request, pk):
        comment = get_visible_comment_or_404(request, pk)
        queryset = Reply.objects.select_related("author").filter(comment=comment)
        queryset = _with_liked_by_me(queryset, request.user, ReplyLike, "reply")

        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request, view=self)
        serializer = ReplySerializer(page, many=True, context={"request": request})
        return paginator.get_paginated_response(serializer.data)

    @extend_schema(
        tags=["Feed"], request=ReplySerializer, responses={201: ReplySerializer}
    )
    def post(self, request, pk):
        comment = get_visible_comment_or_404(request, pk)
        serializer = ReplySerializer(
            data=request.data, context={"request": request, "comment": comment}
        )
        serializer.is_valid(raise_exception=True)
        with transaction.atomic():
            serializer.save()
            Comment.objects.filter(pk=comment.pk).update(
                replies_count=F("replies_count") + 1
            )
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class ReplyLikeToggleAPIView(APIView):
    @extend_schema(tags=["Feed"], request=None, responses={200: LikeToggleResponseSerializer})
    def post(self, request, pk):
        reply = get_visible_reply_or_404(request, pk)
        liked = _toggle_like(ReplyLike, reply, "reply", request.user)
        reply.refresh_from_db(fields=["likes_count"])
        return Response({"liked": liked, "likes_count": reply.likes_count})


class ReplyLikersAPIView(APIView):
    pagination_class = DefaultPagination

    @extend_schema(tags=["Feed"], responses={200: PublicUserSerializer(many=True)})
    def get(self, request, pk):
        reply = get_visible_reply_or_404(request, pk)
        users = User.objects.filter(reply_likes__reply=reply).order_by(
            "-reply_likes__created_at"
        )
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(users, request, view=self)
        serializer = PublicUserSerializer(page, many=True)
        return paginator.get_paginated_response(serializer.data)
