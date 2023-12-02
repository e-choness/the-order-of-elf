using System;
using System.Collections;
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

    private void Start()
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

        if (isTimeUp) StopTimer();
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
                Debug.LogFormat("Time is up!");
            }

            UpdateTimerMeter();
            UpdateTimerCountDown();

            Debug.LogFormat("Time remaining {0}", timeRemaining);
            Debug.LogFormat("Time meter value: {0}", worldTimer.timerMeter.value);
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
        int seconds = (int)(timeRemaining % 60.0f);
        int minutes = (int)(timeRemaining / 60.0f);
        worldTimer.timerCountDown.text = string.Format("Time Remaining: {0}:{1}", minutes, seconds);
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