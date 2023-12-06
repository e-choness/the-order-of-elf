using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class SightObject : MonoBehaviour
{
    public GameObject interactableIndicator;

    // Start is called before the first frame update
    void Start()
    {
        GetComponentInChildren<Camera>().enabled = false;
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void HandleInteraction(bool isActive)
    {
        interactableIndicator.SetActive(isActive);
    }
}
