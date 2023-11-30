using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ClueSpawner : MonoBehaviour
{
    public Clue[] clueData; // Assign this in the inspector
    public Transform[] clueSpawns;

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
                Instantiate(clue.cluePrefab, spawnLocation.position, Quaternion.identity);
                Instantiate(clue.particleEffectPrefab, spawnLocation.position, clue.cluePrefab.transform.rotation);
                clue.isPickedUp = false;

                // Now remove the used spawn location
                availableSpawns.RemoveAt(index);
            }
        }
    }
}
