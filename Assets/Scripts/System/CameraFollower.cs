using UnityEngine;

namespace System
{
    public class CameraFollower : MonoBehaviour
    {
        [SerializeField] private Transform player;
        [SerializeField] private float distance = 3.0f;
        [SerializeField] private float height = 2.0f;
        [SerializeField] private float smoothTime = 0.25f;

        private Vector3 _currentVelocity;

        private void LateUpdate()
        {
            Vector3 target = player.position + (-player.transform.forward * distance);
            target += Vector3.up * height;
            transform.position = Vector3.SmoothDamp(transform.position, target, ref _currentVelocity, smoothTime);
            transform.LookAt(player);
        }
    }
}
