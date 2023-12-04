using Hertzole.GoldPlayer;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class PlayerScript : MonoBehaviour
{
    public GoldPlayerController controller;
    public bool isHidden;
    public bool isInvisible;
    public bool isMorphed;
    public bool isCrouching;
    public bool isCast;
    public GameObject sandBlast;
    public Transform spawnPosition;
    public GameObject toyPrefab; // Reference to the toy prefab
    private GameObject currentToyInstance; // Reference to the instantiated toy
    public GameObject elfPlayer;

    private Coroutine invisibleCoroutine; // Reference to the currently running coroutine
    private Coroutine morphCoroutine; // Reference to the currently running coroutine
    private float hiddenDuration = 5f; // Duration for which the player remains hidden
    public GameObject hiddenEffect;

    public Image shimmer;
    public Image morph;
    public Image sight;

    public MagicManager magicManager;

    private void Start()
    {
        hiddenEffect.SetActive(false);
    }
    private void Update()
    {
        if(isMorphed || isInvisible || isCast)
        {
            magicManager.timer = magicManager.spellReplenishTime;
        }
    }

    public void CastSpell(int spell)
    {
        if (spell == 1)
        {
            if (invisibleCoroutine != null)
            {
                StopCoroutine(invisibleCoroutine); // Stop the current coroutine if it's running
            }
            invisibleCoroutine = StartCoroutine(Invisible());
        }

        if (spell == 2)
        {
            if (morphCoroutine != null)
            {
                StopCoroutine(morphCoroutine); // Stop the current coroutine if it's running
            }
            morphCoroutine = StartCoroutine(Morph());
        }
    }

    public void ThrowSand()
    {
        GameObject blast = Instantiate(sandBlast, spawnPosition.position, spawnPosition.rotation);

        // Convert Vector3.back to the character's local space
        Vector3 localBack = spawnPosition.TransformDirection(Vector3.forward);

        // Apply force in the local back direction
        blast.GetComponent<Rigidbody>().AddForce(localBack * 100);
    }

    IEnumerator Invisible()
    {
        isHidden = true;
        hiddenEffect.SetActive(true);
        isInvisible = true;
        shimmer.color = Color.green;
        yield return new WaitForSeconds(hiddenDuration);
        isHidden = false;
        hiddenEffect.SetActive(false);
        isInvisible = false;
        shimmer.color = Color.white;
    }

    IEnumerator Morph()
    {
        // Disable player and set states
        elfPlayer.SetActive(false);
        isMorphed = true;
        isHidden = true;
        morph.color = Color.green;
        // Instantiate toy at player's position
        currentToyInstance = Instantiate(toyPrefab, spawnPosition.position, transform.rotation);

        // Wait for player input to revert back
        yield return new WaitUntil(() => Input.GetKeyDown(KeyCode.W) || Input.GetKeyDown(KeyCode.A) || Input.GetKeyDown(KeyCode.S) || Input.GetKeyDown(KeyCode.D));

        // Destroy toy and re-enable player
        elfPlayer.SetActive(true);
        currentToyInstance.GetComponentInChildren<AudioSource>().Stop();
        isMorphed = false;
        isHidden = false;
        morph.color = Color.white;
    }
}
