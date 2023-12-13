using UnityEngine;
using TMPro;
using Unity.VisualScripting;

public class ParentClue : MonoBehaviour
{
    public Clue clue; // Reference to the ScriptableObject
    public GameObject clueCanvas;
    public TextMeshProUGUI textBox; // Reference to the TMPro text box
    public WorldDetection worldDetection; // Reference to the WorldDetection script
    public bool clueActivated;
    public bool hasInteracted;
    public GameObject interactableIndicator; // The interactable indicator on this AI object

    public ClueSpawner clueManager;

    void OnEnable()
    {
        clueCanvas.SetActive(false);
        interactableIndicator.SetActive(false);
    }

    public void InteractWithPlayer()
    {
        if (!worldDetection.detected)
        {
            clueActivated = true;
            clueCanvas.SetActive(true);
            textBox.text = clue.context;
            Time.timeScale = 0.1f;
            if(!hasInteracted)
            {
                hasInteracted = true;
                clueManager.cluesInt++;
                clueManager.clueSound.Play();
                clueManager.ClueFound(clue);
            }
        }
    }

    public void HandleInteraction(bool isActive)
    {
        interactableIndicator.SetActive(isActive);
    }

    private void Update()
    {
        if (Input.GetKeyDown(KeyCode.C))
        {
            if(clueActivated)
            {
                clueCanvas.SetActive(false);
                Time.timeScale = 1f;
            }
        }
    }
}