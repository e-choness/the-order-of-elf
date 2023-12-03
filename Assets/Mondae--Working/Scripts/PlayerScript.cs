using Hertzole.GoldPlayer;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class PlayerScript : MonoBehaviour
{
    public GoldPlayerController controller;
    public bool isHidden;
    public bool isCrouching;
    public GameObject sandBlast;
    public Transform spawnPosition;

    private void Update()
    {

    }

    public void CastSpell(int spell)
    {

    }

    public void ThrowSand()
    {
        GameObject blast = Instantiate(sandBlast, spawnPosition.position, spawnPosition.rotation);

        // Convert Vector3.back to the character's local space
        Vector3 localBack = spawnPosition.TransformDirection(Vector3.forward);

        // Apply force in the local back direction
        blast.GetComponent<Rigidbody>().AddForce(localBack * 100);
    }
}
