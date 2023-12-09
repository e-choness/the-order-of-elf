using Unity.VisualScripting;
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
    }

    public string GetContext()
    {
        return context;
    }
}
