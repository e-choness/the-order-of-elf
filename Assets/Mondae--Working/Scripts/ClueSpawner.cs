using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class ClueSpawner : MonoBehaviour
{
    public Clue[] clueData; // Assign this in the inspector
    public Transform[] clueSpawns;
    public TextMeshProUGUI clueFoundText;
    public int cluesInt;
    public AudioSource clueSound;

    public GameObject solved;
    public bool cluesFound;
    public GameObject endCanvas;

    public TextMeshProUGUI clueList;

    private List<string> foundClueContexts = new List<string>();
    public GameObject clueListUI;

    void Start()
    {
        solved.SetActive(false);
        SpawnClues();
    }

    public void SpawnClues()
    {
        // Convert array to list for easy removal of elements
        List<Transform> availableSpawns = new List<Transform>(clueSpawns);

        foreach (Clue clue in clueData)
        {
            if (availableSpawns.Count == 0)
            {
                //Debug.LogError("Not enough spawn locations for all clues.");
                return;
            }

            // Pick a random index from the available spawns
            int index = Random.Range(0, availableSpawns.Count);

            if (clue != null && clue.cluePrefab != null)
            {
                Transform spawnLocation = availableSpawns[index];
                GameObject spawnedClue = Instantiate(clue.cluePrefab, spawnLocation.position, Quaternion.identity);
                // Check if there's a particle effect prefab to instantiate
                if (clue.particleEffectPrefab != null)
                {
                    // Instantiate the particle effect as a child of the clue instance
                    GameObject particleEffectInstance = Instantiate(clue.particleEffectPrefab, spawnedClue.transform.position, Quaternion.identity, spawnedClue.transform);
                    particleEffectInstance.transform.localPosition = Vector3.zero; // Optionally adjust the local position if needed
                }
                clue.isPickedUp = false;
                if (spawnedClue.GetComponent<Rigidbody>() == null)
                    spawnedClue.AddComponent<Rigidbody>();
                Rigidbody rb = spawnedClue.GetComponent<Rigidbody>();
                spawnedClue.GetComponent<Rigidbody>().useGravity = true;
                spawnedClue.GetComponent<Rigidbody>().isKinematic = true;
                SphereCollider collider = spawnedClue.AddComponent<SphereCollider>();
                float radius = collider.radius;
                collider.radius = radius + 0.4f;
                collider.isTrigger = true;
                spawnedClue.tag = "Clue";
                spawnedClue.AddComponent<ClueInteraction>();
                ClueBehaviour clueBehaviour = spawnedClue.AddComponent<ClueBehaviour>(); // Add the ClueBehaviour component
                clueBehaviour.clueData = clue;

                // Now remove the used spawn location
                availableSpawns.RemoveAt(index);
            }
        }
    }

    private void Update()
    {
        clueFoundText.text = cluesInt + "/9 Clues Found";
        if (cluesInt >= 9 && !cluesFound)
        {
            cluesFound = true;
            clueFoundText.text = "All Clues Found!";
            solved.SetActive(true);
        }

        if (Input.GetKeyDown(KeyCode.Alpha3) && cluesFound)
        {
            solved.SetActive(false);
            endCanvas.SetActive(true);
        }

        if (Input.GetKeyDown(KeyCode.Tab))
        {
            // Toggle the active state of the UI GameObject
            clueListUI.SetActive(!clueListUI.activeSelf);
        }
    }

    public void ClueFound(Clue clue)
    {
        cluesInt++;
        clueSound.Play();
        foundClueContexts.Add(clue.GetContext());

        // Update UI or call a method to display the updated list of found clues
        UpdateClueListUI();
    }
    private void UpdateClueListUI()
    {
        string clueListText = "";
        foreach (string context in foundClueContexts)
        {
            clueListText += "- " + context + "\n";
        }

        // Assuming you have a TextMeshProUGUI component to display the list
        // Replace 'yourTextComponent' with the actual component
        clueList.text = clueListText;
    }

}
