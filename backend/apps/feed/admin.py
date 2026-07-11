from django.contrib import admin

from .models import Comment, CommentLike, Post, PostLike, Reply, ReplyLike

admin.site.register(Post)
admin.site.register(Comment)
admin.site.register(Reply)
admin.site.register(PostLike)
admin.site.register(CommentLike)
admin.site.register(ReplyLike)
