using System.Collections;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class MagicSelector : MonoBehaviour
{
    public Button shimmerButton;
    public Button morphButton;
    public Button secondSightButton;
    public Button startGameButton;
    public Image ability1Image;
    public Image ability2Image;
    public TextMeshProUGUI ability1Text;
    public TextMeshProUGUI ability2Text;
    public Sprite[] images;

    private string ability1 = "";
    private string ability2 = "";

    public GameObject player;
    public GameObject HUD;

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

    void Start()
    {
        shimmerButton.onClick.AddListener(() => SelectAbility("SHIMMER"));
        morphButton.onClick.AddListener(() => SelectAbility("MORPH"));
        secondSightButton.onClick.AddListener(() => SelectAbility("SECOND SIGHT"));
        startGameButton.onClick.AddListener(StartGame);

        startGameButton.interactable = false; // Start with the Start Game button disabled

        ability1Image.enabled = false;
        ability2Image.enabled = false;
    }

    void SelectAbility(string abilityName)
    {
        if (ability1 == abilityName || ability2 == abilityName)
        {
            // Ability is already selected, do nothing or provide feedback to the user
            return;
        }

        if (string.IsNullOrEmpty(ability1))
        {
            ability1 = abilityName;
            UpdateAbilityDisplay(ability1Image, ability1Text, ability1, 1);
        }
        else if (string.IsNullOrEmpty(ability2))
        {
            ability2 = abilityName;
            UpdateAbilityDisplay(ability2Image, ability2Text, ability2, 2);
        }
        else
        {
            // Replace ability 1 with the new selection and shift the old ability 1 to ability 2
            ability2 = ability1;
            ability1 = abilityName;
            UpdateAbilityDisplay(ability1Image, ability1Text, ability1, 1);
            UpdateAbilityDisplay(ability2Image, ability2Text, ability2, 2);
        }

        startGameButton.interactable = !string.IsNullOrEmpty(ability1) && !string.IsNullOrEmpty(ability2);
    }

    void UpdateAbilityDisplay(Image abilityImage, TextMeshProUGUI abilityText, string abilityName, int slot)
    {
        if (slot == 1)
        {
            ability1Image.enabled = true;
            abilityText.text = "MAGIC #1: " + abilityName;
            if (abilityName == "SHIMMER")
                abilityImage.sprite = images[0];
            else if (abilityName == "MORPH")
                abilityImage.sprite = images[1];
            else if (abilityName == "SECOND SIGHT")
                abilityImage.sprite = images[2];
        }
        else if (slot == 2)
        {
            ability2Image.enabled = true;
            abilityText.text = "MAGIC #2: " + abilityName;
            if (abilityName == "SHIMMER")
                abilityImage.sprite = images[0];
            else if (abilityName == "MORPH")
                abilityImage.sprite = images[1];
            else if (abilityName == "SECOND SIGHT")
                abilityImage.sprite = images[2];
        }
    }

    void StartGame()
    {
        // Save the selected abilities for reference later
        PlayerPrefs.SetString("Ability1", ability1);
        PlayerPrefs.SetString("Ability2", ability2);
        PlayerPrefs.Save();

        // Resume the game before starting
        player.SetActive(true);
        HUD.SetActive(true);
        this.gameObject.SetActive(false);
        Time.timeScale = 1f;
    }
}
