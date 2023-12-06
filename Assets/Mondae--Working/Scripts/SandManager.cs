using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

public class SandManager : MonoBehaviour
{

    public PlayerScript player;
    public AudioSource sandSource;

    public Image[] sandImages;
    public float sandReplenishRate = 5f;

    private int sandAvailable;
    private float timer;
    private Stack<int> cooldownStack;

    void OnEnable()
    {
        sandAvailable = sandImages.Length;
        cooldownStack = new Stack<int>();
    }

    void Update()
    {

        if (Input.GetMouseButtonDown(0) && sandAvailable > 0)
        {
            player.ThrowSand();
            sandAvailable--;
            sandImages[sandAvailable].enabled = false;

            cooldownStack.Push(sandAvailable);
            if (cooldownStack.Count == 1)
            {
                timer = sandReplenishRate;
            }
            sandSource.Play();
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
    void ReplenishSpell()
    {
        if (cooldownStack.Count > 0)
        {
            int spellToReplenish = cooldownStack.Pop();
            sandImages[spellToReplenish].enabled = true;
            sandAvailable++;

            if (cooldownStack.Count > 0)
            {
                timer = sandReplenishRate;
            }
            else
            {
                timer = 0;
            }
        }
    }

}
