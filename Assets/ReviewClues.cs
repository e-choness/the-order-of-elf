using Hertzole.GoldPlayer;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using TMPro; // Import TextMeshPro

public class ReviewClues : MonoBehaviour
{
    public GoldPlayerController controller;
    public PlayerScript player;
    public TextMeshProUGUI hintText; // Reference to the TextMeshProUGUI component
    public List<string> hints; // List of hints
    public GameObject controls;

    void OnEnable()
    {
        DisplayRandomHint();
        controls.SetActive(false);
    }

    void Update()
    {
        // Existing code for UI and game control
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible = true;
        controller.Camera.CanLookAround = false;
        controller.Movement.CanJump = false;
        controller.Movement.CanCrouch = false;
        Time.timeScale = 0f;
    }

    void OnDisable()
    {
        // Existing code for UI and game control
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
        controller.Camera.CanLookAround = true;
        controller.Movement.CanJump = true;
        controller.Movement.CanCrouch = true;
        Time.timeScale = 1f;
    }

    public void Quit()
    {
        Application.Quit();
    }

    public void Resume()
    {
        player.isPaused = false;
        this.gameObject.SetActive(false);
    }

    private void DisplayRandomHint()
    {
        if (hints.Count > 0)
            hintText.text = hints[Random.Range(0, hints.Count)]; // Set random hint
    }

    public void ShowControls()
    {
        controls.SetActive(true);
    }
}
