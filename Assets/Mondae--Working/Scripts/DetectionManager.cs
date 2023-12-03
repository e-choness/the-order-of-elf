using UnityEngine;

public class DetectionManager : MonoBehaviour
{
    private static DetectionManager instance;
    public int detectionCount = 0;
    public WorldDetection worldDetection;

    void Awake()
    {
        if (instance != null && instance != this)
        {
            Destroy(this.gameObject);
        }
        else
        {
            instance = this;
        }
    }

    public static DetectionManager Instance
    {
        get { return instance; }
    }

    public void RegisterDetection()
    {
        detectionCount++;
        UpdateDetectedStatus();
    }

    public void DeregisterDetection()
    {
        if (detectionCount > 0) 
            detectionCount--;
        UpdateDetectedStatus();
    }

    private void UpdateDetectedStatus()
    {
        worldDetection.detected = detectionCount > 0;
    }
}
