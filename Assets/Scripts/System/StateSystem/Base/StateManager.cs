using System.Collections.Generic;
using UnityEngine;

namespace System.StateSystem
{
    public class StateManager<TState> : MonoBehaviour where TState : Enum
    {
        // States are mapped by state keys
        protected Dictionary<TState, BaseState<TState>> States = new();

        // Current State
        protected BaseState<TState> CurrentState;

        // Is transitioning state flag
        protected bool IsTransitioningState = false;
        
        // Start with current state, do null check ALWAYS
        protected void Start()
        {
            CurrentState.EnterState();
        }

        // This is MonoBehavior inheritance will update with the game loop when being instantiated 
        protected void Update()
        {
            var nextStateKey = CurrentState.GetNextState();
            
            // If the same key  and is not transitioning, keep using the current state update logic
            if (!IsTransitioningState && nextStateKey.Equals(CurrentState.StateKey))
            {
                CurrentState.UpdateState();
            }
            // If the state key has been updated and current state is not transitioning, go to the next state
            else if (!IsTransitioningState)
            {
                TransitionToState(nextStateKey);
            }
        }

        protected void TransitionToState(TState stateKey)
        {
            // Set transitioning state to true, state update happens every frame
            // Using a flag to guard it against unnecessary updates
            IsTransitioningState = true;
            CurrentState.ResetValues();
            CurrentState.ExitState();
            CurrentState = States[stateKey];
            CurrentState.EnterState();
            IsTransitioningState = false;
        }

        protected void OnTriggerEnter(Collider other)
        {
            CurrentState.OnTriggerEnter(other);
        }

        protected void OnTriggerStay(Collider other)
        {
            CurrentState.OnTriggerStay(other);
        }

        protected void OnTriggerExit(Collider other)
        {
            CurrentState.OnTriggerExit(other);
        }
    }
}
