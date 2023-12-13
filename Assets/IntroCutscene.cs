using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class IntroCutscene : MonoBehaviour
{
    public GameObject[] gameObjects; // Array to hold your GameObjects
    public float fadeInDuration = 2.0f; // Duration for each object to fully appear
    public float holdDuration = 4.0f; // Duration for each object to fully appear
    private bool firstload;

    void OnEnable()
    {
        StartCoroutine(SequenceFadeIn());
    }

    IEnumerator FadeIn(GameObject obj)
    {
        float currentTime = 0;
        Image image = obj.GetComponent<Image>(); // Get the Image component

        while (currentTime < fadeInDuration)
        {
            float alpha = Mathf.Lerp(0, 1, currentTime / fadeInDuration);
            image.color = new Color(image.color.r, image.color.g, image.color.b, alpha);
            currentTime += Time.deltaTime;
            yield return null;
        }
    }


    IEnumerator SequenceFadeIn()
    {
        if (!firstload)
        {
            firstload = true;
            yield return new WaitForSeconds(holdDuration-1);
        }
        foreach (GameObject obj in gameObjects)
        {
            StartCoroutine(FadeIn(obj));
            yield return new WaitForSeconds(holdDuration);
        }
    }
}
