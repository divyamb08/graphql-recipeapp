from django.contrib import admin
from .models import Recipe, RecipeStep
# Register your models here.

admin.site.register(Recipe)
admin.site.register(RecipeStep)
