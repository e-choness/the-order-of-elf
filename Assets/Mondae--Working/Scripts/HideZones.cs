using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;

public class HideZones : MonoBehaviour
{
    public TextMeshProUGUI hiddenText;
    public GameObject effect;
    public bool hiddenActivated;
    // Start is called before the first frame update
    void Start()
    {
        hiddenText.enabled = false;
    }

    // Update is called once per frame
    void Update()
    {

    }

    private void OnTriggerEnter(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            if (other.GetComponent<PlayerScript>().isHidden == false)
            {
                hiddenActivated = true;
                other.GetComponent<PlayerScript>().isHidden = true;
                if (hiddenText.enabled == false)
                    hiddenText.enabled = true;
                effect.SetActive(false);
            }
        }
    }

    private void OnTriggerExit(Collider other)
    {
        if (other.CompareTag("Player"))
        {
            if (hiddenActivated == true)
            {
                other.GetComponent<PlayerScript>().isHidden = false;
                hiddenText.enabled = false;
                effect.SetActive(true);
            }
        }
    }
}
