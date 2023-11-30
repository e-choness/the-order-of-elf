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
        private void Start()
        {
            if (CurrentState == null) return;
            
            CurrentState.EnterState();
        }

        //
        private void Update()
        {
            
        }
    }
}
