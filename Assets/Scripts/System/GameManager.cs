using UnityEngine;

namespace System
{
    public class GameManager : Singleton<GameManager>
    {
        [SerializeField] private float gravity = -30.0f;
        private void Start()
        {
            SetGravity();
        }

        private void SetGravity()
        {
            Physics.gravity = new Vector3(0.0f, gravity, 0.0f);
        }
    }
}
