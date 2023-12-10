using Hertzole.GoldPlayer;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ReviewClues : MonoBehaviour
{
    public GoldPlayerController controller;
    public PlayerScript player;
    void Update()
    {
        // When UI is active, show the cursor and unlock it.
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible = true;
        controller.Camera.CanLookAround = false;
        controller.Movement.CanJump = false;
        controller.Movement.CanCrouch = false;

        // Pause the game
        Time.timeScale = 0f;
    }

    void OnDisable()
    {
        // When UI is inactive, hide the cursor and lock it.
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
        controller.Camera.CanLookAround = true;
        controller.Movement.CanJump = true;
        controller.Movement.CanCrouch = true;

        // Resume the game
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
}
