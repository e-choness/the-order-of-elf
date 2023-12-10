using Hertzole.GoldPlayer;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ReviewClues : MonoBehaviour
{
    public GoldPlayerController controller;
    void Update()
    {
        // When UI is active, show the cursor and unlock it.
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible = true;
        controller.Camera.CanLookAround = false;

        // Pause the game
        Time.timeScale = 0f;
    }

    void OnDisable()
    {
        // When UI is inactive, hide the cursor and lock it.
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
        controller.Camera.CanLookAround = true;

        // Resume the game
        Time.timeScale = 1f;
    }
}
