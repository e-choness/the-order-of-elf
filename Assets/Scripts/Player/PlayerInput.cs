using System;
using UnityEngine;
using UnityEngine.InputSystem;
using UnityEngine.Serialization;

namespace Player
{
    [RequireComponent(typeof(Rigidbody))]
    public class PlayerInput : Singleton<PlayerInput>
    {
        [SerializeField] private float jumpForce = 20.0f;
        [SerializeField] private float moveSpeed = 5.0f;

        private InputAction _jumpAction;
        private InputAction _moveAction;
        
        private Rigidbody _rigidbody;
        private Vector2 _moveDirection = Vector2.zero;
        private bool _isGrounded = true;

        private new void Awake()
        {
            InputController inputController = new();

            _jumpAction = inputController.Player.Jump;
            _moveAction = inputController.Player.Move;
        }
        private void Start()
        {
            _rigidbody = GetComponent<Rigidbody>();
        }

        private void OnEnable()
        {
            _jumpAction.Enable();
            _moveAction.Enable();
            
            _jumpAction.performed += OnJumpPerformed;
            _jumpAction.canceled += OnJumpCanceled;
        }

        private void OnDisable()
        {
            _jumpAction.performed -= OnJumpPerformed;
            _jumpAction.canceled -= OnJumpCanceled;
            
            // _moveAction.performed -= OnMoving;
            
            _jumpAction.Disable();
            _moveAction.Disable();
        }

        private void OnJumpPerformed(InputAction.CallbackContext context)
        {
            if (_isGrounded)
            {
                _rigidbody.velocity = Vector3.up * jumpForce;
                _isGrounded = false;
                Debug.LogFormat("{0} - {1} jumping.", nameof(PlayerInput), nameof(OnJumpPerformed));
            }
                
        }

        private void OnJumpCanceled(InputAction.CallbackContext context)
        {
            if (!_isGrounded)
            {
                _rigidbody.velocity = Vector3.zero;
            }
        }

        private void FixedUpdate()
        {
            Walk();
        }

        private void Walk()
        {
            _moveDirection = _moveAction.ReadValue<Vector2>().normalized;
            _rigidbody.AddForce(new Vector3(_moveDirection.x, 0.0f,
            _moveDirection.y) * (moveSpeed * Time.fixedDeltaTime), ForceMode.VelocityChange);
            
            Debug.LogFormat("{0} - {1} at {2}", nameof(PlayerInput), nameof(Walk), _moveDirection.ToString() );
        }


        private void OnTriggerEnter(Collider other)
        {
            if (other.CompareTag("Ground")) _isGrounded = true;
        }
    }
}
