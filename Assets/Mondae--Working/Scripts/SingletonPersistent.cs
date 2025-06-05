using UnityEngine;

public class SingletonPersistent<T> : MonoBehaviour where T: Component
{
    /// <remarks>
    /// Creates a Singleton GameObject which is persistent thru scenes
    /// </remarks>
    public static T Instance { get; private set; }

    public void Awake()
    {
        if (Instance == null)
        {
            Instance = this as T;
            DontDestroyOnLoad(this);
        }
        else
        {
            Destroy(gameObject);
        }
    }
}
