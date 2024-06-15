import React, { useState, useEffect } from 'react';
import {  useMutation, gql, useSubscription, useQuery } from '@apollo/client';

import './index.css';
import 'bootstrap/dist/css/bootstrap.css';

const GET_RECIPES_QUERY = gql`
  query GetRecipes {
    allRecipes {
      id
      name
      steps {
        id
        description
        stepNumber
        isCompleted
      }
    }
  }
`;

const ADD_RECIPE_MUTATION = gql`
  mutation AddRecipe($name: String!) {
    createRecipe(name: $name) {
      id
      name
    }
  }
`;

const ADD_STEP_MUTATION = gql`
  mutation AddStep($recipeId: ID!, $description: String!) {
    createStep(recipeId: $recipeId, description: $description) {
      id
      description
    }
  }
`;

const DELETE_STEP_MUTATION = gql`
  mutation DeleteStep($stepId: ID!) {
    deleteStep(stepId: $stepId) 
  }
`;

const UPDATE_STEP_MUTATION = gql`
  mutation UpdateStep($stepId: ID!, $description: String!) {
    updateStep(stepId: $stepId, description: $description) {
      id
      description
    }
  }
`;

const COMPLETE_STEP_MUTATION = gql`
  mutation CompleteStep($stepId: ID!) {
    completeStep(stepId: $stepId) {
      id
      description
      isCompleted
    }
  }
`;

const INCOMPLETE_STEP_MUTATION = gql`
  mutation IncompleteStep($stepId: ID!) {
    incompleteStep(stepId: $stepId) {
      id
      description
      isCompleted
    }
  }
`;

function App() {
  const [addRecipe, setAddRecipe] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [stepDescription, setStepDescription] = useState("");
  const [selectedSteps, setSelectedSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState([]); 
  const [editStepDescription, setEditStepDescription] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [filter, setFilter] = useState("Steps");

  const { loading, error, data } = useQuery(GET_RECIPES_QUERY);
  const [createRecipe] = useMutation(ADD_RECIPE_MUTATION, {
    refetchQueries: [
      { query: GET_RECIPES_QUERY },
    ],
  });
  const [addStep] = useMutation(ADD_STEP_MUTATION, {
    refetchQueries: [
      { query: GET_RECIPES_QUERY }, 
    ],
  });
  const [deleteStep] = useMutation(DELETE_STEP_MUTATION, {
    refetchQueries: [
      { query: GET_RECIPES_QUERY }, 
    ],
  });
  const [updateStep] = useMutation(UPDATE_STEP_MUTATION, {
    refetchQueries: [{ query: GET_RECIPES_QUERY }],
  });
  const [completeStep] = useMutation(COMPLETE_STEP_MUTATION, {
    refetchQueries: [{ query: GET_RECIPES_QUERY }],
  });
  const [incompleteStep] = useMutation(INCOMPLETE_STEP_MUTATION, {
    refetchQueries: [{ query: GET_RECIPES_QUERY }],
  });

  useEffect(() => {
    if (selectedRecipe && data) {
      const recipe = data.allRecipes.find(r => r.id === Number(selectedRecipe));
      if (recipe) {
        const steps = recipe.steps.filter(step => filter === "Steps" ? !step.isCompleted : step.isCompleted);
        setSelectedSteps(steps.map(step => ({ ...step, checked: false })));
      }
    }
  }, [selectedRecipe, data, filter]);

  const handleInputChange = (event) => {
    setAddRecipe(event.target.value);
  };

  const handleAddRecipe = () => {
    createRecipe({ variables: { name: addRecipe } });
    setAddRecipe("");
  };

  const handleRecipeSelect = (event) => {
    setSelectedRecipe(event.target.value);
  };

  const handleStepInputChange = (event) => {
    setStepDescription(event.target.value);
  };

  const handleAddStep = () => {
    addStep({ variables: { recipeId: selectedRecipe, description: stepDescription } });
    setStepDescription("");
  };

  const handleCheckboxChange = (stepId) => {
    setSelectedSteps(prevSteps =>
      prevSteps.map(step =>
        step.id === stepId ? { ...step, checked: !step.checked } : step
      )
    );
  };

  const handleDeleteSelected = () => {
    selectedSteps.forEach(step => {
      if (step.checked) {
        deleteStep({ variables: { stepId: step.id } })
          .then(response => {
            console.log('Deletion message:', response.data.deleteStep);
          })
          .catch(error => {
            console.error('Error deleting step:', error);
          });
      }
    });
    setSelectedSteps(prevSteps => prevSteps.filter(step => !step.checked));
  };
  const handleUpdateStep = () => {
    const stepToUpdate = selectedSteps.find(step => step.checked);
    updateStep({ variables: { stepId: stepToUpdate.id, description: editStepDescription } });
    setIsEditing(false);
    setEditStepDescription("");
  };
  const handleEditSelected = () => {
    const stepToEdit = selectedSteps.find(step => step.checked);
    if (stepToEdit) {
      setEditStepDescription(stepToEdit.description);
      setIsEditing(true);
    }
  };

  const handleCompleteSelected = () => {
    selectedSteps.forEach(step => {
      if (step.checked) {
        completeStep({ variables: { stepId: step.id } })
          .then(response => {
            setCompletedSteps(prev => [...prev, response.data.completeStep]);
          });
      }
    });
  };

  const handleIncompleteSelected = () => {
    selectedSteps.forEach(step => {
      if (step.checked) {
        incompleteStep({ variables: { stepId: step.id } })
          .then(response => {
            setSelectedSteps(prev => prev.filter(s => s.id !== step.id));
          });
      }
    });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container">
      <h1>Welcome to Recipe Tracker</h1>
      <h5>Start by creating/choosing your food article and adding steps.</h5>
      <form className="row g-3">
        <div className="col-auto">
          <label htmlFor="addRecipe" className="form-label col-auto large">Add a Food Article</label>
        </div>
        <div className="col-auto">
          <input type="text" className="form-control col-auto" value={addRecipe} onChange={handleInputChange} id="addRecipe" placeholder="Butter Chicken"/>
        </div>
        <div className="col-auto">
          <button type="button" className="btn btn-primary" onClick={handleAddRecipe}>Add</button>
        </div>
      </form> 
      <br />
      <h5>OR</h5>
      <br />
      <form className="row g-2">
        <div className="col-auto">
          <label htmlFor="recipeSelect" className="form-label col-auto large">Select from Database</label>
        </div>
        <select className="form-select" aria-label="recipe select" id="recipeSelect" value={selectedRecipe} onChange={handleRecipeSelect}>
        {data && data.allRecipes && data.allRecipes.map(({ id, name }) => (
          <option key={id} value={id}>{name}</option>
        ))}
      </select>
      </form>
      <br />
      <form className="row g-3">
        <div className="col-auto">
          <label htmlFor="addRecipeStep" className="form-label col-auto large">Add a recipe step</label>
        </div>
        <div className="col-auto">
          <input type="text" className="form-control col-auto" value={stepDescription} onChange={handleStepInputChange} id="addRecipeStep" placeholder="Describe the step" />
        </div>
        <div className="col-auto">
          <button type="button" className="btn btn-primary" onClick={handleAddStep}>Add Step</button>
        </div>
      </form>
      <br />
      <div className="row g-3">
        <div className="col-auto">
          <label htmlFor="filterSelect" className="form-label col-auto large">Filter Steps</label>
        </div>
        <div className="col-auto">
          <select className="form-select" id="filterSelect" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="Steps">Steps</option>
            <option value="Completed steps">Completed steps</option>
          </select>
        </div>
      </div>
      <br />
      <h4>Showing the recipe for {selectedRecipe}</h4>
      <br />
      {isEditing && (
        <div>
          <input type="text" value={editStepDescription} onChange={(e) => setEditStepDescription(e.target.value)} />
          <button onClick={handleUpdateStep}>OK</button>
        </div>
      )}
      {/* List steps with checkboxes */}
      {selectedSteps.map(step => (
        <div key={step.id} className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            checked={step.checked}
            onChange={() => handleCheckboxChange(step.id)}
            id={`step-${step.id}`}
          />
          <label className="form-check-label" htmlFor={`step-${step.id}`}>
            Step {step.stepNumber}: {step.description}
          </label>
        </div>
      ))}
      <button type="button" className="btn btn-outline-danger" onClick={handleDeleteSelected}>
        Delete Selected
      </button>
      <button type="button" className="btn btn-outline-secondary" onClick={handleEditSelected} disabled={selectedSteps.filter(step => step.checked).length !== 1}>
        Edit Selected
      </button>
      {filter === "Steps" && (
        <button type="button" className="btn btn-outline-success" onClick={handleCompleteSelected}>
          Complete Selected
        </button>
      )}
      {filter === "Completed steps" && (
        <button type="button" className="btn btn-warning" onClick={handleIncompleteSelected}>
          Incomplete
        </button>
      )}
    </div>
  );
}

export default App;
