using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.SceneManagement;

public class GameOver : MonoBehaviour
{
    public GameObject player;
    public GameObject worldManager;
    public GameObject[] enemies;
    private void OnEnable()
    {
        player.SetActive(false);
        worldManager.SetActive(false);
        foreach (GameObject ai in enemies)
            ai.SetActive(false);
    }
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

    public void Restart()
    {
        SceneManager.LoadScene("JohnsonFamily");
    }

    public void Menu()
    {
        SceneManager.LoadScene("MainMenu");
    }

    public void Quit()
    {
        Application.Quit();
    }
}
