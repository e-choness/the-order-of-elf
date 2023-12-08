using Hertzole.GoldPlayer;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.InputSystem.HID;
using UnityEngine.UI;

public class PlayerScript : MonoBehaviour
{
    public GoldPlayerController controller;
    public WorldDetection detection;

    public bool isHidden;
    public bool isInvisible;
    public bool isMorphed;
    public bool isCrouching;
    public bool isCast;
    public GameObject sandBlast;
    public Transform spawnPosition;
    public Transform spawnPositionSand;
    public GameObject toyPrefab; // Reference to the toy prefab
    private GameObject currentToyInstance; // Reference to the instantiated toy
    public GameObject elfPlayer;

    private Coroutine invisibleCoroutine; // Reference to the currently running coroutine
    private Coroutine morphCoroutine; // Reference to the currently running coroutine
    private float hiddenDuration = 5f; // Duration for which the player remains hidden
    public GameObject hiddenEffect;

    public MagicManager magicManager;

    public Image image1;
    public Image image2;

    public LayerMask interactableLayer; // Layer mask for interactable objects (like AI NPCs)

    public Camera playerCamera; // Reference to the player's camera
    private Camera interactableCamera; // Camera on the interactable object
    public GameObject hitObject;

    public GameObject[] ai;

    private void OnEnable()
    {
        hiddenEffect.SetActive(false);
        StartCoroutine(AI());
    }

    IEnumerator AI()
    {
        yield return new WaitForSeconds(0.25f);
        foreach (var enemy in ai)
            enemy.SetActive(true);
    }
    private void Update()
    {
        if (isMorphed || isInvisible || isCast)
        {
            magicManager.timer = 5;
        }

        if (Input.GetKeyDown(KeyCode.E)) // Assuming E is the interact key
        {
            CheckForInteractable();
        }

        if (isCast && (Input.GetKeyDown(KeyCode.W) || Input.GetKeyDown(KeyCode.A) || Input.GetKeyDown(KeyCode.S) || Input.GetKeyDown(KeyCode.D)))
        {
            ReturnPlayerVision();
        }

        //if (Input.GetKeyDown(KeyCode.Alpha3)) // Assuming 3 is the key to cast vision
        //{
        //    TryCastVision();
        //}

        PerformRaycastCheck();
    }

    //private void TryCastVision()
    //{
    //    RaycastHit hit;
    //    if (Physics.Raycast(playerCamera.transform.position, playerCamera.transform.forward, out hit, 10f, interactableLayer))
    //    {
    //        if (hit.collider.tag == "Interactable")
    //        {
    //            CastSpell(3);
    //        }
    //    }
    //}

    private void PerformRaycastCheck()
    {
        RaycastHit hit;
        if (Physics.Raycast(playerCamera.transform.position, playerCamera.transform.forward, out hit, 10f, interactableLayer))
        {
            if (hit.collider.tag == "AI")
            {
                if (hit.collider.gameObject.GetComponent<ParentClue>() != null)
                    hit.collider.gameObject.GetComponent<ParentClue>().HandleInteraction(true);
            }
            else if (hit.collider.tag == "Interactable" && (PlayerPrefs.GetString("Ability1") == "SECOND SIGHT" || (PlayerPrefs.GetString("Ability2") == "SECOND SIGHT")))
            {
                hitObject = hit.collider.gameObject;
                hit.collider.gameObject.GetComponent<SightObject>().HandleInteraction(true);
            }
        }
        else
        {
            ResetAllInteractions();
        }
    }

    private void ResetAllInteractions()
    {
        foreach (var ai in FindObjectsOfType<ParentClue>())
        {
            if (ai.interactableIndicator.activeInHierarchy == true)
                ai.HandleInteraction(false);
        }

        foreach (var ai in FindObjectsOfType<SightObject>())
        {
            if (ai.interactableIndicator.activeInHierarchy == true)
                ai.HandleInteraction(false);
        }
        hitObject = null;
    }

    void ReturnPlayerVision()
    {
        if (interactableCamera != null)
        {
            interactableCamera.enabled = false; // Disable the interactable object's camera
            playerCamera.enabled = true; // Enable the player's camera
            isCast = false; // Indicate that the vision spell is no longer active
            elfPlayer.SetActive(true);
            if (magicManager.ability1Active == true)
            {
                image1.color = Color.white;
                magicManager.ability1Active = false;
            }
            else if (magicManager.ability2Active == true)
            {
                image2.color = Color.white;
                magicManager.ability2Active = false;
            }
        }
    }

    void CheckForInteractable()
    {
        RaycastHit hit;
        if (Physics.Raycast(playerCamera.transform.position, playerCamera.transform.forward, out hit, 10f, interactableLayer)) // 3f is the max distance for interaction
        {
            if (hit.collider.tag == "AI" && !detection.detected && hit.collider.gameObject.GetComponent<ParentClue>() != null)
                hit.collider.gameObject.GetComponent<ParentClue>().InteractWithPlayer();
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

        if (spell == 3 && hitObject != null)
        {
            interactableCamera = hitObject.GetComponentInChildren<Camera>(); // Assuming the interactable object has a child with a Camera
            if (interactableCamera != null)
            {
                playerCamera.enabled = false;
                interactableCamera.enabled = true;
                isCast = true;
                elfPlayer.SetActive(false);
            }
        }
    }

    public void ThrowSand()
    {
        GameObject blast = Instantiate(sandBlast, spawnPositionSand.position, spawnPositionSand.rotation);

        // Convert Vector3.back to the character's local space
        Vector3 localBack = spawnPositionSand.TransformDirection(Vector3.forward);

        // Apply force in the local back direction
        blast.GetComponent<Rigidbody>().AddForce(localBack * 100);
    }

    IEnumerator Invisible()
    {
        isHidden = true;
        hiddenEffect.SetActive(true);
        isInvisible = true;
        yield return new WaitForSeconds(hiddenDuration);
        isHidden = false;
        hiddenEffect.SetActive(false);
        isInvisible = false;
        if (magicManager.ability1Active == true)
        {
            image1.color = Color.white;
            magicManager.ability1Active = false;
        }
        else if (magicManager.ability2Active == true)
        {
            image2.color = Color.white;
            magicManager.ability2Active = false;
        }
    }

    IEnumerator Morph()
    {
        // Disable player and set states
        elfPlayer.SetActive(false);
        isMorphed = true;
        isHidden = true;
        // Instantiate toy at player's position
        currentToyInstance = Instantiate(toyPrefab, spawnPosition.position, transform.rotation);

        // Wait for player input to revert back
        yield return new WaitUntil(() => Input.GetKeyDown(KeyCode.W) || Input.GetKeyDown(KeyCode.A) || Input.GetKeyDown(KeyCode.S) || Input.GetKeyDown(KeyCode.D));

        // Destroy toy and re-enable player
        elfPlayer.SetActive(true);
        currentToyInstance.GetComponentInChildren<AudioSource>().Stop();
        isMorphed = false;
        isHidden = false;
        if (magicManager.ability1Active == true)
        {
            image1.color = Color.white;
            magicManager.ability1Active = false;
        }
        else if (magicManager.ability2Active == true)
        {
            image2.color = Color.white;
            magicManager.ability2Active = false;
        }
    }
}
