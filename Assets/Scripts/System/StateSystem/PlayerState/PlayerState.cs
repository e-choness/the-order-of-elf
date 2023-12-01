using UnityEngine;

namespace System.StateSystem.PlayerState
{
    public class PlayerState : BaseState<PlayerMovement>
    {
        public Vector3 PlayerTransform { get; set; }

        public PlayerState(PlayerMovement key): base(key)
        {
        }

        public override void EnterState()
        {
            
        }

        public override void ExitState()
        {
        
        }

        public override void UpdateState()
        {
        
        }

        public override PlayerMovement GetNextState()
        {
            return StateKey;
        }

        public override void OnTriggerEnter(Collider other)
        {
        
        }

        public override void OnTriggerStay(Collider other)
        {
        
        }

        public override void OnTriggerExit(Collider other)
        {
        
        }

        public override void ResetValues()
        {
        
        }
    }
}
