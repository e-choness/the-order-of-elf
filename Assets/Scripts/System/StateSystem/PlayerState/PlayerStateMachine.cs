using UnityEngine;

namespace System.StateSystem.PlayerState
{
    public class PlayerStateMachine : StateManager<PlayerMovement>
    {
        [SerializeField] private float jumpForce = 20.0f;
        [SerializeField] private float moveSpeed = 5.0f;
        
        private Rigidbody _rigidbody;
        private Vector2 _moveDirection = Vector2.zero;
        private bool _isGrounded = true;
        private new void Start()
        {
            CurrentState = new PlayerState(PlayerMovement.Idle);
            States.Add(PlayerMovement.Idle, CurrentState);
            base.Start();
        }
    }
}
