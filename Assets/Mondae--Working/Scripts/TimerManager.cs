using System;
using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.PlayerLoop;
using UnityEngine.Serialization;

[RequireComponent(typeof(WorldTimer))]
public class TimerManager : Singleton<TimerManager>
{
    [Header("World Timer")]
    [SerializeField] WorldTimer worldTimer;

    [Header("Timer Settings")]
    [Tooltip("Seconds maximum for player to finish the mission.")] 
    [SerializeField]
    private float timeForMission = 30.0f;

    [Tooltip("Seconds remain for player to finish the mission.")] 
    [SerializeField]
    private float timeRemaining;

    [Tooltip("Controls how smooth the timer meter moves.")] 
    [SerializeField]
    private float timeInterval = 1.0f;

    [Header("Timer Status")]
    public bool isTimeUp;
    public bool isTimerPaused;

    public GameObject gameOver;
    public TextMeshProUGUI finalText;

    void OnEnable()
    {
        timeRemaining = timeForMission;
        isTimeUp = false;
        isTimerPaused = false;
        worldTimer.GetComponent<WorldTimer>();
        StartTimer();
    }

    private void StartTimer()
    {
        StartCoroutine(Coundown());
    }

    private void Update()
    {
        if (isTimerPaused)
        {
            PauseTimer();
        }
        else
        {
            ResumeTimer();
        }

        if (isTimeUp)
        {
            finalText.text = "YOU HAVE RAN OUT OF TIME";
            gameOver.SetActive(true);
            StopTimer();
        }
    }

    IEnumerator Coundown()
    {
        while (!isTimeUp)
        {
            // Calculate time remaining
            timeRemaining -= timeInterval;
            
            // Stop timer and pause game 
            if (timeRemaining <= 0)
            {
                timeRemaining = 0;
                isTimeUp = true;
                isTimerPaused = true;
                //Debug.LogFormat("Time is up!");
            }

            UpdateTimerMeter();
            UpdateTimerCountDown();

            //Debug.LogFormat("Time remaining {0}", timeRemaining);
            //Debug.LogFormat("Time meter value: {0}", worldTimer.timerMeter.value);
            yield return new WaitForSeconds(timeInterval);


            if (isTimeUp) yield break;
        }
    }

    void UpdateTimerMeter()
    {
        // Normalize remaining time to fit timer meter value
        worldTimer.timerMeter.value = Mathf.Clamp(timeRemaining / timeForMission,
            0.0f,
            timeForMission);
    }

    void UpdateTimerCountDown()
    {
        // Calculate remaining minutes and seconds
        var seconds = (int)(timeRemaining % 60.0f);
        var minutes = (int)(timeRemaining / 60.0f);
        
        // Show timer on Timer Count Down
        worldTimer.timerCountDown.text = string.Format("Time Remaining {0}:{1}", 
            minutes.ToString("D2"), 
            seconds.ToString("D2"));
        
        // Show Time Is Up message when timer stops
        if (isTimeUp)
            worldTimer.timerCountDown.text = "Time Is Up!";
    }


    public void StopTimer()
    {
        // Logic to load the scene to the HQ for briefing
    }

    public void PauseTimer()
    {
        // Add logic here for UI components
    }

    // Pau for pausing UI
    public void ResumeTimer()
    {
        // Add logic here for Gameplay
    }
}