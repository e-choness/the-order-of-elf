using System.Collections;
using System.Collections.Generic;
using TMPro;
using UnityEngine;
using UnityEngine.UI;

public class GiftSelector : MonoBehaviour
{
    public Button gift1;
    public Button gift2;
    public Button gift3;
    public Button gift4;
    public Button gift5;
    public Button gift6;
    public Button naughtyList;
    public Button niceList;
    public Button submitReport;
    public TextMeshProUGUI giftText;
    public TextMeshProUGUI loadingText;
    public TextMeshProUGUI quitText;
    public TextMeshProUGUI listText;

    public GameObject ReportUI;
    public TextMeshProUGUI resultsText;

    private string gift = "";
    private string list = "";

    public GameObject player;
    public GameObject HUD;
    public GameObject[] ai;

    private const string ChosenGiftKey = "ChosenGift";
    private const string ChosenListKey = "ChosenList";

    public WinningCriteria criteria;
    // Start is called before the first frame update
    void OnEnable()
    {
        player.SetActive(false);
        HUD.SetActive(false);
        foreach (var ai in ai)
        {
            ai.SetActive(false);
        }
        ReportUI.SetActive(false);
        quitText.enabled = false;
        loadingText.enabled = false;
        gift1.onClick.AddListener(() => SelectGift("Dino Dart Blaster 5000"));
        gift2.onClick.AddListener(() => SelectGift("Bite Me, Vampire Teeth"));
        gift3.onClick.AddListener(() => SelectGift("LED Hoverboard Pro"));
        gift4.onClick.AddListener(() => SelectGift("Dunk-O-Matic Basketball Hoop"));
        gift5.onClick.AddListener(() => SelectGift("Cat Litter EZ-Clean"));
        gift6.onClick.AddListener(() => SelectGift("No Shot, Basketball Socks"));
        naughtyList.onClick.AddListener(() => SelectList("Naughty"));
        niceList.onClick.AddListener(() => SelectList("Nice"));

        submitReport.onClick.AddListener(SubmitReport);

        submitReport.interactable = false; // Start with the Start Game button disabled
    }

    void SelectGift(string giftName)
    {
        if (gift == giftName)
        {
            // Ability is already selected, do nothing or provide feedback to the user
            return;
        }

        if (string.IsNullOrEmpty(gift))
        {
            gift = giftName;
            UpdateGiftDisplay(giftText, gift);
        }
        else
        {
            // Replace ability 1 with the new selection and shift the old ability 1 to ability 2
            gift = giftName;
            UpdateGiftDisplay(giftText, gift);
        }

        submitReport.interactable = !string.IsNullOrEmpty(gift) && !string.IsNullOrEmpty(list);
    }

    void SelectList(string listName)
    {
        if (list == listName)
        {
            // Ability is already selected, do nothing or provide feedback to the user
            return;
        }

        if (string.IsNullOrEmpty(list))
        {
            list = listName;
            UpdateListDisplay(listText, list);
        }
        else
        {
            // Replace ability 1 with the new selection and shift the old ability 1 to ability 2
            list = listName;
            UpdateListDisplay(listText, list);
        }

        submitReport.interactable = !string.IsNullOrEmpty(gift) && !string.IsNullOrEmpty(list);
    }

    void UpdateGiftDisplay(TextMeshProUGUI itemText, string itemName)
    {
        itemText.text = itemName;
    }

    void UpdateListDisplay(TextMeshProUGUI itemText, string itemName)
    {
        itemText.text = itemName + " List";
    }

    // Update is called once per frame
    void Update()
    {
        // When UI is active, show the cursor and unlock it.
        Cursor.lockState = CursorLockMode.None;
        Cursor.visible = true;

        // Resume the game
        Time.timeScale = 1f;
    }

    void OnDisable()
    {
        // When UI is inactive, hide the cursor and lock it.
        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;

        // Resume the game
        Time.timeScale = 1f;
    }

    void SubmitReport()
    {
        // Save the selected abilities for reference later
        PlayerPrefs.SetString(ChosenGiftKey, gift);
        if (list == "Naughty")
            PlayerPrefs.SetInt(ChosenListKey, 0);
        else if (list == "Nice")
            PlayerPrefs.SetInt(ChosenListKey, 1);
        PlayerPrefs.Save();

        criteria.DecideEnding();
        ReportUI.SetActive(true);
        StartCoroutine(Results());
    }

    IEnumerator Results()
    {
        yield return new WaitForSeconds(.5f);
        loadingText.enabled = true;
        yield return new WaitForSeconds(1f);
        if (criteria.demotion)
            resultsText.text = "Incorrect gift and list selected.  You have been DEMOTED";
        else if (criteria.promotion)
            resultsText.text = "Correct gift and list selected.  You have been PROMOTED";
        else if (criteria.neutral)
            resultsText.text = "Incorrect gift or list selected.  You have received a RECOGNITION";
        quitText.enabled = true;
    }
}
