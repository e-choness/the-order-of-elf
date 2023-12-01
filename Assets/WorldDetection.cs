using System.Collections;
using UnityEngine;
using TMPro;
using UnityEngine.UI;

public class WorldDetection : MonoBehaviour
{
    public TextMeshProUGUI detectedText;
    public Slider detectionSlider;
    public TextMeshProUGUI percentageText; // Text to display the fill percentage
    public bool detected;

    public float incrementRate = 0.1f; // The rate at which the slider increases
    public float decrementRate = 0.05f; // The rate at which the slider decreases
    public float duration = 2.0f; // Duration over which the increment/decrement happens

    private Coroutine changeSliderCoroutine;
    private bool wasDetectedLastFrame; // Track the detection state across frames

    // Start is called before the first frame update
    void Start()
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
    }

    IEnumerator ChangeSliderValue(float rate)
    {
        float elapsedTime = 0;
        float startValue = detectionSlider.value;

        while (elapsedTime < duration)
        {
            detectionSlider.value = Mathf.Clamp(startValue + (rate * elapsedTime / duration), detectionSlider.minValue, detectionSlider.maxValue);
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
        percentageText.text = $"{percentage:0}%"; // Format the percentage to one decimal place
    }
}
