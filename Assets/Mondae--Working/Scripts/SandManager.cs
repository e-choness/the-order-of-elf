using UnityEngine;
using UnityEngine.UI;

public class SandManager : MonoBehaviour
{
    public Slider sandSlider; // Assign the UI slider for sand in the inspector
    public float sandDepleteRate = 0.1f; // Rate at which sand depletes per second
    public float sandReplenishRate = 0.05f; // Rate at which sand replenishes per second

    public PlayerScript player;
    public AudioSource sandSource;

    void Start()
    {
        // Initialize the sand slider to max value
        sandSlider.value = sandSlider.maxValue;
    }

    void Update()
    {
        // Deplete sand when the left mouse button is held down and sand is available
        if (Input.GetMouseButton(0) && sandSlider.value > 0)
        {
            player.ThrowSand();
            sandSlider.value -= sandDepleteRate * Time.deltaTime;
            if (!sandSource.isPlaying)
                sandSource.Play();
            // Here you can add logic to activate the sand ability
        }
        // Replenish sand when the left mouse button is not held down and sand is not full
        else if (!Input.GetMouseButton(0) && sandSlider.value < sandSlider.maxValue)
        {
            sandSlider.value += sandReplenishRate * Time.deltaTime;
            sandSource.Stop();
        }
        if (sandSlider.value == 0)
            sandSource.Stop();
    }
}
