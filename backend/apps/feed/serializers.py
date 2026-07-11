from rest_framework import serializers

from apps.auth.serializers import PublicUserSerializer

from .models import Comment, Post, Reply


class PostSerializer(serializers.ModelSerializer):
    author = PublicUserSerializer(read_only=True)
    liked_by_me = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = Post
        fields = [
            "id",
            "author",
            "text",
            "image",
            "visibility",
            "likes_count",
            "comments_count",
            "liked_by_me",
            "created_at",
        ]
        read_only_fields = ["likes_count", "comments_count", "created_at"]

    def validate(self, attrs):
        text = attrs.get("text", "")
        image = attrs.get("image")
        if not text and not image:
            raise serializers.ValidationError(
                "A post must include text or an image."
            )
        return attrs

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        return super().create(validated_data)


class CommentSerializer(serializers.ModelSerializer):
    author = PublicUserSerializer(read_only=True)
    liked_by_me = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = Comment
        fields = [
            "id",
            "post",
            "author",
            "text",
            "likes_count",
            "replies_count",
            "liked_by_me",
            "created_at",
        ]
        read_only_fields = ["post", "likes_count", "replies_count", "created_at"]

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        validated_data["post"] = self.context["post"]
        return super().create(validated_data)


class ReplySerializer(serializers.ModelSerializer):
    author = PublicUserSerializer(read_only=True)
    liked_by_me = serializers.BooleanField(read_only=True, default=False)

    class Meta:
        model = Reply
        fields = [
            "id",
            "comment",
            "author",
            "text",
            "likes_count",
            "liked_by_me",
            "created_at",
        ]
        read_only_fields = ["comment", "likes_count", "created_at"]

    def create(self, validated_data):
        validated_data["author"] = self.context["request"].user
        validated_data["comment"] = self.context["comment"]
        return super().create(validated_data)
