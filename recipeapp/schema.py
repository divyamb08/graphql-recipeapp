import strawberry
from typing import List, Optional
from .models import Recipe, RecipeStep
from .types import RecipeType, StepType

@strawberry.type
class Query:
    @strawberry.field
    def all_recipes(self, info, completed: Optional[bool] = None) -> List[RecipeType]:
        query = Recipe.objects.prefetch_related('steps')
        if completed is not None:
            query = query.filter(steps__is_completed=completed)
        return query.all()
    
@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_recipe(self, name:str) -> RecipeType:
        recipeName = Recipe(name=name)
        recipeName.save()
        return recipeName
    
    @strawberry.mutation
    def delete_recipe(self, recipe_id:strawberry.ID) -> str:
        try:
            recipe = Recipe.objects.get(id=recipe_id)
            recipe.delete()
            return "Recipe deleted successfully"
        except Recipe.DoesNotExist:
            return "Recipe not found"


    @strawberry.mutation
    def create_step(self, info, recipe_id: strawberry.ID, description: str) -> StepType:
        recipe = Recipe.objects.get(id=recipe_id)
        step = RecipeStep.objects.create(recipe=recipe, description=description)
        return step
    
    @strawberry.mutation
    def update_step(self, info, step_id: strawberry.ID, description: str) -> StepType:
        step = RecipeStep.objects.get(id=step_id)
        step.description = description
        step.save()
        return step
    
    @strawberry.mutation
    def delete_step(self, info, step_id: strawberry.ID) -> None:
        try:
            step = RecipeStep.objects.get(id=step_id)
            step.delete()
            return
        except RecipeStep.DoesNotExist:
            return
        
    @strawberry.mutation
    def complete_step(self, info, step_id: strawberry.ID) -> StepType:
        step = RecipeStep.objects.get(id=step_id)
        step.is_completed = True
        step.save()
        return step

    @strawberry.mutation
    def incomplete_step(self, info, step_id: strawberry.ID) -> StepType:
        step = RecipeStep.objects.get(id=step_id)
        step.is_completed = False
        step.save()
        return step

schema = strawberry.Schema(query=Query, mutation=Mutation)