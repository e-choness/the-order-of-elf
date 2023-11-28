using UnityEngine;

namespace System
{
    public class Singleton<T> : MonoBehaviour where T : Component
    {
        public static T Instance { get; set; }

        public void Awake()
        {
            if (Instance == null)
            {
                Instance = this as T;
            }
            else
            {
                Destroy(gameObject);
            }
        }
    }
}
