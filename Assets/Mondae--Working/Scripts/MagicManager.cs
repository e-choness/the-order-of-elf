using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class MagicManager : MonoBehaviour
{
    public Image[] spellImages; 
    public float spellReplenishTime = 5f; 

    public int spellsAvailable;
    public float timer;
    private Stack<int> cooldownStack; 
    public AudioSource magicSource;
    public bool spellCast;

    public PlayerScript player;
    public LayerMask interactableLayer; // Layer mask for interactable objects (like AI NPCs)

    public Sprite[] sprites;
    public Image magic1;
    public Image magic2;

    public bool ability1Active;
    public bool ability2Active;

    void OnEnable()
    {
        spellsAvailable = spellImages.Length; 
        cooldownStack = new Stack<int>();

        string ability1 = PlayerPrefs.GetString("Ability1");
        if (ability1 == "SHIMMER")
        {
            magic1.sprite = sprites[0];
        }
        else if (ability1 == "MORPH")
        {
            magic1.sprite = sprites[1];
        }
        else if (ability1 == "SECOND SIGHT")
        {
            magic1.sprite = sprites[2];
        }

        string ability2 = PlayerPrefs.GetString("Ability2");
        if (ability2 == "SHIMMER")
        {
            magic2.sprite = sprites[0];
        }
        else if (ability2 == "MORPH")
        {
            magic2.sprite = sprites[1];
        }
        else if (ability2 == "SECOND SIGHT")
        {
            magic2.sprite = sprites[2];
        }
    }

    void Update()
    {
        // Check if the player has pressed the key for ability 1, has spells available, and is not already casting a spell
        if (Input.GetKeyDown(KeyCode.Alpha1) && spellsAvailable > 0 && !player.isMorphed && !player.isCast && !player.isInvisible && !player.isPaused)
        {
            // Retrieve the string for ability 1 from PlayerPrefs and check which ability it corresponds to
            string ability1 = PlayerPrefs.GetString("Ability1");
            if (ability1 == "SHIMMER")
            {
                player.CastSpell(1); // Cast the spell associated with SHIMMER
                spellCast = true; // Set the flag indicating a spell was cast
                CastSpell();
                ability1Active = true;
                player.image1.color = Color.red;
            }
            else if (ability1 == "MORPH")
            {
                player.CastSpell(2); // Cast the spell associated with MORPH
                spellCast = true; // Set the flag indicating a spell was cast
                CastSpell();
                ability1Active = true;
                player.image1.color = Color.blue;
            }
            else if (ability1 == "SECOND SIGHT")
            {
                TryCastVision(1); // Cast the spell associated with SECOND SIGHT
            }
        }

        // Check if the player has pressed the key for ability 2, has spells available, and is not already casting a spell
        if (Input.GetKeyDown(KeyCode.Alpha2) && spellsAvailable > 0 && !player.isInvisible && !player.isCast && !player.isMorphed && !player.isPaused)
        {
            // Retrieve the string for ability 2 from PlayerPrefs and check which ability it corresponds to
            string ability2 = PlayerPrefs.GetString("Ability2");
            if (ability2 == "SHIMMER")
            {
                player.CastSpell(1); // Cast the spell associated with SHIMMER
                spellCast = true; // Set the flag indicating a spell was cast
                CastSpell();
                ability2Active = true;
                player.image2.color = Color.red;
            }
            else if (ability2 == "MORPH")
            {
                player.CastSpell(2); // Cast the spell associated with MORPH
                spellCast = true; // Set the flag indicating a spell was cast
                CastSpell();
                ability2Active = true;
                player.image2.color = Color.blue;
            }
            else if (ability2 == "SECOND SIGHT")
            {
                TryCastVision(2); // Cast the spell associated with SECOND SIGHT
            }
        }
        //if (Input.GetKeyDown(KeyCode.Alpha3) && spellsAvailable > 0 && !player.isInvisible && !player.isMorphed && !player.isCast)
        //{
        //    TryCastVision();
        //}

        // Update cooldown timer
        if (cooldownStack.Count > 0 && timer > 0)
        {
            timer -= Time.deltaTime;
            if (timer <= 0)
            {
                ReplenishSpell();
            }
        }
    }

    void TryCastVision(int slot)
    {
        RaycastHit hit;
        if (Physics.Raycast(player.playerCamera.transform.position, player.playerCamera.transform.forward, out hit, 10f, interactableLayer))
        {
            if (hit.collider.tag == "Interactable")
            {
                player.hitObject = hit.collider.gameObject;
                player.CastSpell(3); // Cast the vision spell on the interactable object
                spellCast = true;
                CastSpell();
                if (slot == 1)
                {
                    ability1Active = true;
                    player.image1.color = Color.green;
                }
                else
                {
                    ability2Active = true;
                    player.image2.color = Color.green;
                }
            }
        }
    }

    void CastSpell()
    {
        if (spellsAvailable > 0 && spellCast)
        {
            spellCast = false;
            spellsAvailable--;
            spellImages[spellsAvailable].enabled = false; 

            cooldownStack.Push(spellsAvailable); 
            if (cooldownStack.Count == 1) 
            {
                timer = spellReplenishTime;
            }
            magicSource.Play();
        }
    }

    void ReplenishSpell()
    {
        if (cooldownStack.Count > 0)
        {
            int spellToReplenish = cooldownStack.Pop();
            spellImages[spellToReplenish].enabled = true; 
            spellsAvailable++;

            if (cooldownStack.Count > 0)
            {
                timer = spellReplenishTime;
            }
            else
            {
                timer = 0; 
            }
        }
    }
}
