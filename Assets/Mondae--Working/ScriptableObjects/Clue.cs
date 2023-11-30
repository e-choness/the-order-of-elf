using UnityEngine;

[CreateAssetMenu(fileName = "New Clue", menuName = "Clue System/Clue")]
public class Clue : ScriptableObject
{
    public string context; // Description of the clue
    public bool isPickedUp; // Whether the clue has been picked up
    public GameObject particleEffectPrefab; // The particle effect prefab
    public GameObject cluePrefab; // The visual prefab of the clue

    // Method to call when the clue is picked up
    public void OnPickUp()
    {
        isPickedUp = true;
        // Activate or instantiate particle effect
        if (particleEffectPrefab != null)
        {
            // Instantiate or enable the particle effect at the clue's position
            particleEffectPrefab.SetActive(false);
            Destroy(cluePrefab);
        }
        // Additional logic for when the clue is picked up, if necessary
    }
}
