using System.Collections;
using UnityEngine;
using TMPro;
using UnityEngine.UI;

public class WorldDetection : MonoBehaviour
{
    public TextMeshProUGUI detectedText;
    public Slider detectionSlider;
    public TextMeshProUGUI percentageText;
    public bool detected;

    public float incrementRate = 0.1f;
    public float decrementRate = 0.05f;
    public float duration = 2.0f;

    private Coroutine changeSliderCoroutine;
    private bool wasDetectedLastFrame;

    public GameObject gameOver;
    public TextMeshProUGUI finalText;

    // Start is called before the first frame update
    void OnEnable()
    {
        wasDetectedLastFrame = detected;
        UpdatePercentageText();
    }

    // Update is called once per frame
    void Update()
    {
        detectedText.enabled = detected;

        if (detected != wasDetectedLastFrame)
        {
            if (changeSliderCoroutine != null)
            {
                StopCoroutine(changeSliderCoroutine);
            }
            changeSliderCoroutine = StartCoroutine(ChangeSliderValue(detected ? incrementRate : -decrementRate));
            wasDetectedLastFrame = detected;
        }

        if(detectionSlider.value == 1)
        {
            finalText.text = "YOU HAVE BEEN DETECTED";
            gameOver.SetActive(true);
        }
    }

    IEnumerator ChangeSliderValue(float rate)
    {
        float elapsedTime = 0;
        float startValue = detectionSlider.value;

        while (elapsedTime < duration)
        {
            detectionSlider.value = Mathf.Clamp(startValue + (rate * elapsedTime), detectionSlider.minValue, detectionSlider.maxValue);
            UpdatePercentageText();
            elapsedTime += Time.deltaTime;
            yield return null;
        }

        detectionSlider.value = Mathf.Clamp(startValue + rate, detectionSlider.minValue, detectionSlider.maxValue);
        UpdatePercentageText();
    }


    void UpdatePercentageText()
    {
        float percentage = detectionSlider.value / (detectionSlider.maxValue - detectionSlider.minValue) * 100;
        percentageText.text = $"{percentage:0}%";
    }
}