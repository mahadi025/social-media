from django.core.exceptions import ValidationError

MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024


def validate_image_size(image):
    if image.size > MAX_IMAGE_SIZE_BYTES:
        raise ValidationError("Image must be smaller than 5MB.")
