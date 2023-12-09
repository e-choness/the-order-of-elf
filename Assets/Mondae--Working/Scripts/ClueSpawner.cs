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

    void Start()
    {
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
                collider.radius = radius + 0.25f;
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
        if (cluesInt >= 9)
        {
            clueFoundText.text = "All Clues Found!";
        }
    }

    public void ClueFound()
    {
        cluesInt++;
        clueSound.Play();
    }
}
