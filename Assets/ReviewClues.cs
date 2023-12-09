using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class ReviewClues : MonoBehaviour
{
    void Update()
    {
        // When UI is active, show the cursor and unlock it.
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible = true;

        // Pause the game
        Time.timeScale = 0f;
    }

    void OnDisable()
    {
        // When UI is inactive, hide the cursor and lock it.
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;

        // Resume the game
        Time.timeScale = 1f;
    }
}
