using System.Collections;
using System.Collections.Generic;
using Unity.VisualScripting;
using UnityEngine;

public class ClueInteraction : MonoBehaviour
{
    private ClueSpawner clueSpawner;
    // Start is called before the first frame update
    void Start()
    {
        clueSpawner = GameObject.FindGameObjectWithTag("ClueSpawner").GetComponent<ClueSpawner>();
    }

    // Update is called once per frame
    void OnTriggerExit(Collider other)
    {
        if(other.CompareTag("Player"))
            other.GetComponent<PlayerScript>().isInteracting = false;
    }
}
