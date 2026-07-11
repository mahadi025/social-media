from django.http import Http404
from django.shortcuts import get_object_or_404

from .models import Comment, Post, Reply


def _assert_post_visible(user, post):
    if post.visibility == Post.Visibility.PRIVATE and post.author_id != user.id:
        raise Http404


def get_visible_post_or_404(request, pk):
    post = get_object_or_404(Post.objects.select_related("author"), pk=pk)
    _assert_post_visible(request.user, post)
    return post


def get_visible_comment_or_404(request, pk):
    comment = get_object_or_404(
        Comment.objects.select_related("post", "author"), pk=pk
    )
    _assert_post_visible(request.user, comment.post)
    return comment


def get_visible_reply_or_404(request, pk):
    reply = get_object_or_404(
        Reply.objects.select_related("comment__post", "author"), pk=pk
    )
    _assert_post_visible(request.user, reply.comment.post)
    return reply
