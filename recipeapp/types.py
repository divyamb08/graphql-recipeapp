import strawberry_django
from strawberry import auto
from typing import List
from . import models

@strawberry_django.type(models.Recipe)
class RecipeType:
    id: int
    name: str
    steps: List['StepType']  # Define a nested list of steps

@strawberry_django.type(models.RecipeStep)
class StepType:
    id: int
    step_number: int
    description: str
    is_completed: bool
