from django.db import models
from django.db.models import Max

# Create your models here.

class Recipe(models.Model):
    name = models.CharField(max_length=100)

class RecipeStep(models.Model):
    recipe = models.ForeignKey(Recipe, related_name='steps', on_delete=models.CASCADE)
    step_number = models.IntegerField(editable=False)
    description = models.TextField()
    is_completed = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.pk:  # Check if this is a new step
            # Get the current highest step number for this recipe
            last_step = RecipeStep.objects.filter(recipe=self.recipe).aggregate(Max('step_number'))['step_number__max']
            self.step_number = 1 if last_step is None else last_step + 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        subsequent_steps = RecipeStep.objects.filter(recipe=self.recipe, step_number__gt=self.step_number)
        super().delete(*args, **kwargs)
        # Update step numbers for all subsequent steps
        for step in subsequent_steps:
            step.step_number -= 1
            step.save()

    