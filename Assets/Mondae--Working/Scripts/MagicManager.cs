using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class MagicManager : MonoBehaviour
{
    public Image[] spellImages; 
    public float spellReplenishTime = 5f; 

    private int spellsAvailable;
    public float timer;
    private Stack<int> cooldownStack; 
    public AudioSource magicSource;
    public bool spellCast;

    public PlayerScript player;

    void Start()
    {
        spellsAvailable = spellImages.Length; 
        cooldownStack = new Stack<int>();
    }

    void Update()
    {
        if (Input.GetKeyDown(KeyCode.Alpha1) && spellsAvailable > 0 && !player.isMorphed)
        {
            player.CastSpell(1);
            spellCast = true;
        }
        if (Input.GetKeyDown(KeyCode.Alpha2) && spellsAvailable > 0 && !player.isInvisible)
        {
            player.CastSpell(2);
            spellCast = true;
        }
        if (Input.GetKeyDown(KeyCode.Alpha3) && spellsAvailable > 0 && !player.isInvisible && !player.isMorphed)
        {
            player.CastSpell(3);
            spellCast = true;
        }

        // Check for spell casting
        if (Input.GetKeyDown(KeyCode.Alpha1) || Input.GetKeyDown(KeyCode.Alpha2) || Input.GetKeyDown(KeyCode.Alpha3))
        {
            CastSpell();
        }

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

    void CastSpell()
    {
        if (spellsAvailable > 0 && spellCast)
        {
            spellsAvailable--;
            spellImages[spellsAvailable].enabled = false; 

            cooldownStack.Push(spellsAvailable); 
            if (cooldownStack.Count == 1) 
            {
                timer = spellReplenishTime;
            }
            magicSource.Play();
            spellCast = false;
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
