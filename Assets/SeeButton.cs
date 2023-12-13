using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class SeeButton : MonoBehaviour
{
    public TextMeshProUGUI text;
    // Start is called before the first frame update
    void OnEnable()
    {
        StartCoroutine(ShowText());
    }

    // Update is called once per frame
    void Update()
    {

    }

    IEnumerator ShowText()
    {
        yield return new WaitForSeconds(12);
        text.enabled = true;
    }
}
